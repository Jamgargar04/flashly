import { create } from 'zustand';

import type { CampusEvent } from '@/domain/event';
import { isCampusPlace } from '@/domain/place';
import { services } from '@/infrastructure/container';

import { PREFERENCES } from './preference-keys';
import { currentStrings } from './use-lang';

export const REMIND_BEFORE_MS = 30 * 60_000;

export type ReminderResult = 'on' | 'off' | 'too-late' | 'denied';

type EventRemindersState = {
  ids: string[];
  hydrate: () => Promise<void>;
  toggle: (event: CampusEvent) => Promise<ReminderResult>;
};

const notificationId = (eventId: string) => `event-${eventId}`;

const persist = (ids: string[]) => services.store.set(PREFERENCES.eventReminders, ids);

/** "Recordarme": un aviso local 30 minutos antes del evento, con un toque. */
export const useEventReminders = create<EventRemindersState>()((set, get) => ({
  ids: [],

  hydrate: async () => set({ ids: await services.store.get<string[]>(PREFERENCES.eventReminders, []) }),

  toggle: async (event) => {
    const { ids } = get();
    if (ids.includes(event.id)) {
      await services.reminders.cancel(notificationId(event.id)).catch(() => undefined);
      const next = ids.filter((id) => id !== event.id);
      set({ ids: next });
      await persist(next);
      return 'off';
    }
    const now = Date.now();
    if (event.startsAt <= now) return 'too-late';
    if (!(await services.reminders.requestPermission())) return 'denied';

    const t = currentStrings();
    const place = event.location && isCampusPlace(event.location) ? t.places[event.location] : event.location;
    // Si faltan menos de 30 minutos, avisa en unos segundos.
    const at = Math.max(event.startsAt - REMIND_BEFORE_MS, now + 5000);
    await services.reminders.scheduleAt(notificationId(event.id), at, {
      title: t.notifications.eventTitle(event.title),
      body: t.notifications.eventBody(place),
    });
    const next = [...ids, event.id];
    set({ ids: next });
    await persist(next);
    return 'on';
  },
}));
