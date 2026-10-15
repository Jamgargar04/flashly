import { useEffect, useState } from 'react';
import { create } from 'zustand';

import type { Classmate } from '@/domain/classmate';
import type { Unsubscribe } from '@/domain/ports';
import { services } from '@/infrastructure/container';

import { PREFERENCES } from './preference-keys';

type DirectoryState = {
  people: Classmate[];
  following: string[];
  followers: number;
  loaded: boolean;
};

type DirectoryActions = {
  start: (uid: string) => Unsubscribe;
  toggleFollow: (uid: string, targetId: string) => Promise<void>;
};

/** Pasa la lista de "amigos" que antes vivía solo en el teléfono a "seguir" (sincronizado). */
const migrateLegacyFriends = async (uid: string, following: string[]) => {
  const legacy = await services.store.get<string[]>(PREFERENCES.legacyFriends, []);
  if (legacy.length === 0) return;
  await Promise.all(legacy.filter((id) => !following.includes(id)).map((id) => services.social.setFollowing(uid, id, true)));
  await services.store.remove(PREFERENCES.legacyFriends);
};

/** Personas del campus y a quién sigues, en tiempo real. */
export const useDirectory = create<DirectoryState & DirectoryActions>()((set, get) => ({
  people: [],
  following: [],
  followers: 0,
  loaded: false,

  start: (uid) => {
    let migrated = false;
    const stops = [
      services.directory.observe(
        (people) => set({ people, loaded: true }),
        () => set({ loaded: true }),
      ),
      services.social.observeFollowing(uid, (following) => {
        set({ following });
        if (migrated) return;
        migrated = true;
        migrateLegacyFriends(uid, following).catch(() => undefined);
      }),
      services.social.observeFollowers(uid, (followers) => set({ followers })),
    ];
    return () => stops.forEach((stop) => stop());
  },

  toggleFollow: async (uid, targetId) => {
    const follow = !get().following.includes(targetId);
    const previous = get().following;
    set({ following: follow ? [...previous, targetId] : previous.filter((id) => id !== targetId) });
    try {
      await services.social.setFollowing(uid, targetId, follow);
    } catch (error) {
      set({ following: previous });
      throw error;
    }
  },
}));

/** Seguidores de otra persona, en vivo (para su ficha de perfil). */
export const useFollowerCount = (uid: string): number => {
  const [count, setCount] = useState(0);
  useEffect(() => services.social.observeFollowers(uid, setCount), [uid]);
  return count;
};
