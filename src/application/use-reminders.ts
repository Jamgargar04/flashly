import { services } from '@/infrastructure/container';

import { PREFERENCES } from './preference-keys';
import { useSession } from './session-store';
import { usePreference } from './use-preference';

/** Aviso diario y modo prueba ("abrir la ventana ahora"). */
export const useReminders = () => {
  const [enabled, setEnabled] = usePreference<boolean>(PREFERENCES.reminders, false);
  const setWindowOverride = useSession((s) => s.setWindowOverride);

  /** Devuelve false si el usuario negó el permiso de notificaciones. */
  const toggle = async (value: boolean): Promise<boolean> => {
    if (!value) {
      await services.reminders.cancelAll();
      await setEnabled(false);
      return true;
    }
    if (!(await services.reminders.requestPermission())) return false;
    await services.reminders.scheduleUpcoming();
    await setEnabled(true);
    return true;
  };

  const openWindowNow = async (): Promise<void> => {
    await setWindowOverride(Date.now() + 5000);
    if (await services.reminders.requestPermission()) await services.reminders.remindIn(5);
  };

  return { enabled, toggle, openWindowNow };
};
