import { create } from 'zustand';

import { toggleLike, type Moment } from '@/domain/moment';
import type { Unsubscribe } from '@/domain/ports';
import { services } from '@/infrastructure/container';

type FeedState = {
  day: string;
  /** Tu momento de hoy; null si aún no publicas. */
  own: Moment | null;
  ownLoaded: boolean;
  moments: Moment[];
  feedLoaded: boolean;
};

type FeedActions = {
  start: (uid: string, day: string, windowStart: number) => Unsubscribe;
  like: (moment: Moment, uid: string) => Promise<void>;
  remove: (moment: Moment) => Promise<void>;
  report: (moment: Moment, uid: string) => Promise<void>;
};

const MAX_RETRY_MS = 30_000;

/**
 * Feed del día en tiempo real, compartido por Hoy, Descubrir y las fichas de lugares y personas.
 * Escucha tu propio momento; en cuanto existe, se suscribe a los de todos ("si no publicas, no ves").
 */
export const useFeed = create<FeedState & FeedActions>()((set, get) => ({
  day: '',
  own: null,
  ownLoaded: false,
  moments: [],
  feedLoaded: false,

  start: (uid, day, windowStart) => {
    set({ day, own: null, ownLoaded: false, moments: [], feedLoaded: false });
    let active = true;
    let stopDay: Unsubscribe | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let delay = 1500;

    const subscribeDay = () => {
      stopDay = services.moments.observeDay(
        day,
        windowStart,
        (moments) => {
          delay = 1500;
          set({ moments, feedLoaded: true });
        },
        () => {
          // Justo después de publicar, el servidor puede no ver aún tu momento: reintenta con espera creciente.
          stopDay = null;
          retry = setTimeout(() => active && get().own && !stopDay && subscribeDay(), delay);
          delay = Math.min(delay * 2, MAX_RETRY_MS);
        },
      );
    };

    const stopOwn = services.moments.observeOwn(
      day,
      uid,
      (own) => {
        set({ own, ownLoaded: true });
        if (own && !stopDay) subscribeDay();
        if (!own && stopDay) {
          stopDay();
          stopDay = null;
          set({ moments: [], feedLoaded: false });
        }
      },
      () => set({ ownLoaded: true }),
    );

    return () => {
      active = false;
      clearTimeout(retry);
      stopOwn();
      stopDay?.();
    };
  },

  like: async (moment, uid) => {
    const flip = (m: Moment) => (m.id === moment.id ? toggleLike(m, uid) : m);
    set((state) => ({ moments: state.moments.map(flip), own: state.own ? flip(state.own) : null }));
    await services.moments.toggleLike(moment, uid);
  },

  remove: async (moment) => {
    set((state) => ({
      moments: state.moments.filter((m) => m.id !== moment.id),
      own: state.own?.id === moment.id ? null : state.own,
    }));
    await services.moments.delete(moment.id);
  },

  report: (moment, uid) =>
    services.reports.report({ kind: 'moment', targetId: moment.id, authorId: moment.authorId, reportedBy: uid }),
}));
