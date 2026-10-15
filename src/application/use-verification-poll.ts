import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useSession } from './session-store';

const POLL_MS = 4000;

/**
 * Revisa sola si ya verificaste el correo: cada pocos segundos y al volver a la app
 * desde el correo. Así no hace falta tocar "Ya lo verifiqué".
 */
export const useVerificationPoll = (onVerified: () => void) => {
  const refreshVerification = useSession((s) => s.refreshVerification);
  const callback = useRef(onVerified);

  useEffect(() => {
    callback.current = onVerified;
  }, [onVerified]);

  useEffect(() => {
    let done = false;
    const check = async () => {
      if (done || AppState.currentState !== 'active') return;
      const verified = await refreshVerification().catch(() => false);
      if (verified && !done) {
        done = true;
        callback.current();
      }
    };
    const id = setInterval(check, POLL_MS);
    const subscription = AppState.addEventListener('change', (state) => state === 'active' && void check());
    return () => {
      done = true;
      clearInterval(id);
      subscription.remove();
    };
  }, [refreshVerification]);
};
