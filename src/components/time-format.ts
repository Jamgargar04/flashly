import { isSameDay } from '@/domain/event-schedule';
import type { Strings } from '@/constants/strings';

type TimeStrings = Strings['time'];

const DAY_MS = 24 * 60 * 60_000;
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "Miércoles 15 de octubre" / "Wednesday, October 15". */
export const longDate = (t: TimeStrings, ms = Date.now()): string => {
  const date = new Date(ms);
  return capitalize(t.longDate(t.days[date.getDay()], date.getDate(), t.months[date.getMonth()]));
};

/** "jue 16" / "Thu 16". */
export const shortDay = (t: TimeStrings, ms: number): string => {
  const date = new Date(ms);
  return `${t.daysShort[date.getDay()]} ${date.getDate()}`;
};

/** Hoy, Mañana o "jue 16" (para eventos y selectores de día). */
export const relativeDay = (t: TimeStrings, ms: number, now = Date.now()): string => {
  if (isSameDay(ms, now)) return t.today;
  if (isSameDay(ms, now + DAY_MS)) return t.tomorrow;
  return capitalize(shortDay(t, ms));
};

/** Hoy, Ayer o la fecha larga (separadores del chat). */
export const chatDay = (t: TimeStrings, ms: number, now = Date.now()): string => {
  if (isSameDay(ms, now)) return t.today;
  if (isSameDay(ms, now - DAY_MS)) return t.yesterday;
  return longDate(t, ms);
};

/** Mes abreviado y día para la insignia de calendario de un evento. */
export const calendarBadge = (t: TimeStrings, ms: number) => {
  const date = new Date(ms);
  return { month: t.monthsShort[date.getMonth()].toUpperCase(), day: String(date.getDate()) };
};

export const clock = (ms: number): string => {
  const d = new Date(ms);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const timeRange = (start: number, end: number): string => `${clock(start)} – ${clock(end)}`;

export const timeAgo = (t: TimeStrings, ms: number, now = Date.now()): string => {
  const minutes = Math.max(0, Math.round((now - ms) / 60_000));
  if (minutes < 1) return t.now;
  if (minutes < 60) return t.minutesAgo(minutes);
  return t.hoursAgo(Math.round(minutes / 60));
};

/** Tiempo restante corto: "23 h" o "45 min". */
export const durationLeft = (t: TimeStrings, ms: number): string => {
  const minutes = Math.max(1, Math.round(ms / 60_000));
  return minutes < 60 ? t.minutes(minutes) : t.hours(Math.round(minutes / 60));
};

/** Duración elegible de un evento: "30 min", "1 h", "2 h". */
export const durationLabel = (t: TimeStrings, minutes: number): string =>
  minutes < 60 ? t.minutes(minutes) : t.hours(minutes / 60);

export const mmss = (seconds: number): string => {
  const s = Math.max(0, seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
