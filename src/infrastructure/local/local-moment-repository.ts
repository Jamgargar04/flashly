import { toggleLike, type Moment, type NewMoment } from '@/domain/moment';
import type { KeyValueStore, MomentRepository, Unsubscribe } from '@/domain/ports';

const momentsKey = (day: string) => `flashly.local.moments.${day}`;
const LIKES = 'flashly.local.likes';

type Seed = (windowStart: number) => Moment[];

/** Repositorio local para el modo demostración. Mezcla los momentos propios con los de ejemplo. */
export class LocalMomentRepository implements MomentRepository {
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
      back: { uri: moment.backUrl },
      front: { uri: moment.frontUrl },
      caption: moment.caption,
      createdAt: Date.now(),
      late: moment.late,
      likes: [],
    });
    await this.store.set(momentsKey(moment.day), own);
  }

  observeDay(day: string, windowStart: number, onChange: (moments: Moment[]) => void, onError: (error: Error) => void): Unsubscribe {
    let active = true;
    this.load(day, windowStart)
      .then((moments) => active && onChange(moments))
      .catch((error: unknown) => active && onError(error instanceof Error ? error : new Error(String(error))));
    return () => {
      active = false;
    };
  }

  async toggleLike(moment: Moment, uid: string): Promise<void> {
    const likes = await this.store.get<Record<string, string[]>>(LIKES, {});
    likes[moment.id] = toggleLike(moment, uid).likes;
    await this.store.set(LIKES, likes);
  }

  async delete(momentId: string): Promise<void> {
    const day = momentId.split('_')[0];
    const own = await this.store.get<Moment[]>(momentsKey(day), []);
    await this.store.set(momentsKey(day), own.filter((m) => m.id !== momentId));
  }

  private async load(day: string, windowStart: number): Promise<Moment[]> {
    const [own, likes] = await Promise.all([
      this.store.get<Moment[]>(momentsKey(day), []),
      this.store.get<Record<string, string[]>>(LIKES, {}),
    ]);
    return [...own, ...this.seed(windowStart)].map((m) => ({ ...m, likes: likes[m.id] ?? m.likes }));
  }
}
