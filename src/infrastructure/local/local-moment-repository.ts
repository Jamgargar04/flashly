import { momentId, toggleLike, type Moment, type NewMoment } from '@/domain/moment';
import type { ErrorListener, KeyValueStore, MomentRepository, Unsubscribe } from '@/domain/ports';

import { LocalChangeNotifier } from './local-change-notifier';

const momentsKey = (day: string) => `flashly.local.moments.${day}`;
const LIKES = 'flashly.local.likes';

type Seed = (windowStart: number) => Moment[];

const asError = (error: unknown): Error => (error instanceof Error ? error : new Error(String(error)));

/** Repositorio local para el modo demostración. Mezcla los momentos propios con los de ejemplo. */
export class LocalMomentRepository implements MomentRepository {
  private readonly changes = new LocalChangeNotifier();

  constructor(private readonly store: KeyValueStore, private readonly seed: Seed = () => []) {}

  async hasPublished(day: string, uid: string): Promise<boolean> {
    const own = await this.store.get<Moment[]>(momentsKey(day), []);
    return own.some((m) => m.authorId === uid);
  }

  async save(moment: NewMoment): Promise<void> {
    const own = await this.store.get<Moment[]>(momentsKey(moment.day), []);
    own.unshift({
      id: moment.id,
      authorId: moment.authorId,
      authorName: moment.authorName,
      authorGroup: moment.authorGroup,
      avatar: moment.authorPhoto ? { uri: moment.authorPhoto } : undefined,
      back: { uri: moment.backUrl },
      front: { uri: moment.frontUrl },
      caption: moment.caption,
      location: moment.location,
      createdAt: Date.now(),
      late: moment.late,
      likes: [],
    });
    await this.store.set(momentsKey(moment.day), own);
    this.changes.notify();
  }

  observeOwn(day: string, uid: string, onChange: (moment: Moment | null) => void, onError: ErrorListener): Unsubscribe {
    return this.watch(
      async () => (await this.store.get<Moment[]>(momentsKey(day), [])).find((m) => m.id === momentId(day, uid)) ?? null,
      onChange,
      onError,
    );
  }

  observeDay(day: string, windowStart: number, onChange: (moments: Moment[]) => void, onError: ErrorListener): Unsubscribe {
    return this.watch(() => this.load(day, windowStart), onChange, onError);
  }

  async toggleLike(moment: Moment, uid: string): Promise<void> {
    const likes = await this.store.get<Record<string, string[]>>(LIKES, {});
    likes[moment.id] = toggleLike(moment, uid).likes;
    await this.store.set(LIKES, likes);
    this.changes.notify();
  }

  async delete(id: string): Promise<void> {
    const day = id.split('_')[0];
    const own = await this.store.get<Moment[]>(momentsKey(day), []);
    await this.store.set(momentsKey(day), own.filter((m) => m.id !== id));
    this.changes.notify();
  }

  /** Emite el valor actual y lo vuelve a emitir cada vez que algo cambia. */
  private watch<T>(read: () => Promise<T>, onChange: (value: T) => void, onError: ErrorListener): Unsubscribe {
    let active = true;
    const emit = () => {
      read()
        .then((value) => active && onChange(value))
        .catch((error: unknown) => active && onError(asError(error)));
    };
    emit();
    const stop = this.changes.subscribe(emit);
    return () => {
      active = false;
      stop();
    };
  }

  private async load(day: string, windowStart: number): Promise<Moment[]> {
    const [own, likes] = await Promise.all([
      this.store.get<Moment[]>(momentsKey(day), []),
      this.store.get<Record<string, string[]>>(LIKES, {}),
    ]);
    return [...own, ...this.seed(windowStart)].map((m) => ({ ...m, likes: likes[m.id] ?? m.likes }));
  }
}
