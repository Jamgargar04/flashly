/** Reglas de la ventana diaria del flash. Lógica pura: no depende de Expo ni de Firebase. */
export const WINDOW_MINUTES = 2;
export const WINDOW_RANGE = { fromHour: 9, toHour: 20 } as const;

export type FlashWindow = { id: string; start: number; end: number };
export type WindowPhase = 'waiting' | 'open' | 'closed';

export const dayId = (date = new Date()): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/** Hash FNV-1a: mismo texto, mismo número, en cualquier dispositivo. */
export const stableHash = (text: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

/** Minuto del día (desde las 00:00) en que se abre la ventana de esa fecha. */
export const surpriseMinute = (id: string): number => {
  const span = (WINDOW_RANGE.toHour - WINDOW_RANGE.fromHour) * 60;
  return WINDOW_RANGE.fromHour * 60 + (stableHash('flashly-' + id) % span);
};

/**
 * Ventana del día. Es "aleatoria" pero igual para todos, porque sale de la fecha;
 * la Cloud Function usa el mismo cálculo. Un override (modo prueba) solo aplica el mismo día.
 */
export const computeWindow = (date = new Date(), overrideStart?: number | null): FlashWindow => {
  const id = dayId(date);
  const duration = WINDOW_MINUTES * 60_000;
  if (overrideStart && dayId(new Date(overrideStart)) === id) {
    return { id, start: overrideStart, end: overrideStart + duration };
  }
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setMinutes(surpriseMinute(id));
  return { id, start: start.getTime(), end: start.getTime() + duration };
};

export const phaseOf = (window: FlashWindow, now: number): WindowPhase => {
  if (now < window.start) return 'waiting';
  if (now < window.end) return 'open';
  return 'closed';
};

export const secondsLeft = (window: FlashWindow, now: number): number => Math.max(0, Math.ceil((window.end - now) / 1000));
