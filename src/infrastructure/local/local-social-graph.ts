import type { KeyValueStore, SocialGraph, Unsubscribe } from '@/domain/ports';

import { LocalChangeNotifier } from './local-change-notifier';

const key = (uid: string) => `flashly.local.following.${uid}`;
const DEMO_FOLLOWERS = 3;

/** "Seguir" guardado en el teléfono para el modo demostración. */
export class LocalSocialGraph implements SocialGraph {
  private readonly changes = new LocalChangeNotifier();

  constructor(private readonly store: KeyValueStore) {}

  observeFollowing(uid: string, onChange: (ids: string[]) => void): Unsubscribe {
    let active = true;
    const emit = () => {
      this.store.get<string[]>(key(uid), []).then((ids) => active && onChange(ids)).catch(() => undefined);
    };
    emit();
    const stop = this.changes.subscribe(emit);
    return () => {
      active = false;
      stop();
    };
  }

  observeFollowers(_uid: string, onChange: (count: number) => void): Unsubscribe {
    onChange(DEMO_FOLLOWERS);
    return () => undefined;
  }

  async setFollowing(uid: string, targetId: string, follow: boolean): Promise<void> {
    const ids = await this.store.get<string[]>(key(uid), []);
    const next = follow ? [...new Set([...ids, targetId])] : ids.filter((id) => id !== targetId);
    await this.store.set(key(uid), next);
    this.changes.notify();
  }
}
