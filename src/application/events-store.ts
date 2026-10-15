import { create } from 'zustand';

import type { CampusEvent } from '@/domain/event';
import type { Unsubscribe } from '@/domain/ports';
import { services } from '@/infrastructure/container';

type EventsState = {
  events: CampusEvent[];
  loaded: boolean;
  start: () => Unsubscribe;
  remove: (eventId: string) => Promise<void>;
};

/** Eventos del campus en tiempo real: un evento nuevo aparece al instante en todos los teléfonos. */
export const useEvents = create<EventsState>()((set) => ({
  events: [],
  loaded: false,

  start: () =>
    services.events.observeUpcoming(
      (events) => set({ events, loaded: true }),
      () => set({ loaded: true }),
    ),

  remove: async (eventId) => {
    set((state) => ({ events: state.events.filter((event) => event.id !== eventId) }));
    await services.events.remove(eventId);
  },
}));
