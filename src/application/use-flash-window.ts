import { useEffect, useState } from 'react';

import { computeWindow, phaseOf, secondsLeft } from '@/domain/flash-window';

import { useSession } from './session-store';

/** Estado de la ventana del día, recalculado cada segundo. */
export const useFlashWindow = () => {
  const windowOverride = useSession((s) => s.windowOverride);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const window = computeWindow(new Date(now), windowOverride);
  return { window, phase: phaseOf(window, now), remaining: secondsLeft(window, now), now };
};
