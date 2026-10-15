/**
 * Calendario del formulario de eventos: días y horarios que se eligen con un toque,
 * sin escribir fechas a mano.
 */
export const SLOT_MINUTES = 30;
export const FIRST_HOUR = 7;
export const LAST_HOUR = 22;

const startOfDay = (ms: number): Date => {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date;
};

/** Medianoche de hoy y de los siguientes días. */
export const upcomingDays = (now: number, count: number): number[] =>
  Array.from({ length: count }, (_, i) => {
    const day = startOfDay(now);
    day.setDate(day.getDate() + i);
    return day.getTime();
  });

/** Horarios del día cada 30 minutos entre las 7:00 y las 21:30; si el día es hoy, solo los que no han pasado. */
export const timeSlots = (day: number, now: number): number[] => {
  const slots: number[] = [];
  for (let minutes = FIRST_HOUR * 60; minutes < LAST_HOUR * 60; minutes += SLOT_MINUTES) {
    const slot = startOfDay(day);
    slot.setMinutes(minutes);
    if (slot.getTime() > now) slots.push(slot.getTime());
  }
  return slots;
};

/** Primer horario disponible: hoy si quedan horarios, si no, mañana a primera hora. */
export const defaultStart = (now: number): number => {
  const today = timeSlots(startOfDay(now).getTime(), now);
  if (today.length > 0) return today[0];
  return timeSlots(upcomingDays(now, 2)[1], now)[0];
};

/** Cambia el día conservando la hora elegida; si ya pasó, toma el siguiente horario libre de ese día. */
export const moveToDay = (start: number, day: number, now: number): number => {
  const original = new Date(start);
  const moved = startOfDay(day);
  moved.setHours(original.getHours(), original.getMinutes(), 0, 0);
  if (moved.getTime() > now) return moved.getTime();
  return timeSlots(day, now)[0] ?? moved.getTime();
};

export const isSameDay = (a: number, b: number): boolean => startOfDay(a).getTime() === startOfDay(b).getTime();
