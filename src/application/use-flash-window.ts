import { computeWindow, phaseOf, secondsLeft } from '@/domain/flash-window';

import { useSession } from './session-store';
import { useNow } from './use-now';

/** Estado de la ventana del día. `intervalMs` corto para cuentas regresivas, largo para lo demás. */
export const useFlashWindow = (intervalMs = 1000) => {
  const windowOverride = useSession((s) => s.windowOverride);
  const now = useNow(intervalMs);
  const window = computeWindow(new Date(now), windowOverride);
  return { window, phase: phaseOf(window, now), remaining: secondsLeft(window, now), now };
};
