import { create } from 'zustand';

import { services } from '@/infrastructure/container';

import { PREFERENCES } from './preference-keys';
import { useSession } from './session-store';
import { currentStrings } from './use-lang';

type RemindersState = {
  enabled: boolean;
  /** Automatización al entrar: la primera vez pide permiso solo; después mantiene programada la semana. */
  autoSetup: () => Promise<void>;
  /** Devuelve false si el teléfono negó el permiso de notificaciones. */
  setEnabled: (enabled: boolean) => Promise<boolean>;
  openWindowNow: () => Promise<void>;
  resetWindow: () => Promise<void>;
};

const flashContent = () => {
  const t = currentStrings().notifications;
  return { title: t.flashTitle, body: t.flashBody };
};

/** Aviso diario del flash. Nadie tiene que acordarse de reactivarlo: se reprograma cada vez que abres la app. */
export const useReminders = create<RemindersState>()((set, get) => ({
  enabled: false,

  autoSetup: async () => {
    const [saved, asked] = await Promise.all([
      services.store.get<boolean | null>(PREFERENCES.reminders, null),
      services.store.get<boolean>(PREFERENCES.remindersAsked, false),
    ]);
    const enabled = saved === true;
    // Solo se activa solo si nunca se eligió; si alguien lo apagó, se respeta.
    if (saved === null && !asked) {
      await services.store.set(PREFERENCES.remindersAsked, true);
      await get().setEnabled(true);
      return;
    }
    set({ enabled });
    if (!enabled) return;
    if (await services.reminders.hasPermission()) await services.reminders.scheduleDailyFlash(flashContent());
    else await get().setEnabled(false);
  },

  setEnabled: async (enabled) => {
    if (!enabled) {
      await services.reminders.cancelDailyFlash();
      await services.store.set(PREFERENCES.reminders, false);
      set({ enabled: false });
      return true;
    }
    if (!(await services.reminders.requestPermission())) {
      await services.store.set(PREFERENCES.reminders, false);
      set({ enabled: false });
      return false;
    }
    await services.reminders.scheduleDailyFlash(flashContent());
    await services.store.set(PREFERENCES.reminders, true);
    set({ enabled: true });
    return true;
  },

  openWindowNow: async () => {
    await useSession.getState().setWindowOverride(Date.now() + 5000);
    if (await services.reminders.requestPermission()) await services.reminders.remindIn(5, flashContent());
  },

  resetWindow: () => useSession.getState().setWindowOverride(null),
}));
