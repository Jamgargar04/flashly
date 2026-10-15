import { useEffect, useState } from 'react';

/** Hora actual que se actualiza sola cada `intervalMs` (cuentas regresivas, "hace 3 min", eventos que vencen). */
export const useNow = (intervalMs: number): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};
