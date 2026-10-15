import { z } from 'zod';

import { DomainError } from './domain-error';
import { parseOrThrow } from './validation';

/** Evento del campus publicado por un administrador. Las fechas son milisegundos. */
export type CampusEvent = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  startsAt: number;
  endsAt: number;
  createdBy: string;
};

export type NewCampusEvent = Omit<CampusEvent, 'id'>;

export const EVENT_LIMITS = { title: 80, description: 280, location: 40 } as const;
/** Duraciones que el administrador puede elegir, en minutos. */
export const EVENT_DURATIONS = [30, 60, 120, 180, 240] as const;
export const EVENT_MAX_DAYS_AHEAD = 60;
/** Margen para no rechazar un evento que empieza "justo ahora". */
const PAST_TOLERANCE_MS = 15 * 60_000;
const HOUR_MS = 60 * 60_000;
const DAY_MS = 24 * HOUR_MS;

export type EventStatus = 'live' | 'soon' | 'upcoming' | 'ended';

export const eventStatus = (event: Pick<CampusEvent, 'startsAt' | 'endsAt'>, now: number): EventStatus => {
  if (now >= event.endsAt) return 'ended';
  if (now >= event.startsAt) return 'live';
  return event.startsAt - now <= HOUR_MS ? 'soon' : 'upcoming';
};

/** Eventos que no han terminado, del más próximo al más lejano. Los vencidos se ocultan solos. */
export const upcomingEvents = <T extends Pick<CampusEvent, 'startsAt' | 'endsAt'>>(events: T[], now: number): T[] =>
  events.filter((event) => event.endsAt > now).sort((a, b) => a.startsAt - b.startsAt);

const draftSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 letras.').max(EVENT_LIMITS.title, 'El título es demasiado largo.'),
  description: z.string().trim().max(EVENT_LIMITS.description, 'La descripción es demasiado larga.'),
  location: z.string().trim().max(EVENT_LIMITS.location, 'El nombre del lugar es demasiado largo.'),
  startsAt: z.number().int(),
  durationMinutes: z.number().int().min(15, 'Elige una duración válida.').max(24 * 60, 'Elige una duración válida.'),
});

export type EventDraft = z.input<typeof draftSchema>;

/**
 * Valida el borrador del administrador y lo convierte en un evento listo para guardar.
 * Se llama antes de subir la portada, así un error no desperdicia la subida.
 */
export const buildEvent = (draft: EventDraft, createdBy: string, now: number): NewCampusEvent => {
  const valid = parseOrThrow(draftSchema, draft);
  if (valid.startsAt < now - PAST_TOLERANCE_MS) throw new DomainError('Elige una fecha y hora que no hayan pasado.', 'event/past');
  if (valid.startsAt > now + EVENT_MAX_DAYS_AHEAD * DAY_MS) {
    throw new DomainError(`Solo puedes programar eventos hasta ${EVENT_MAX_DAYS_AHEAD} días antes.`, 'event/too-far');
  }
  return {
    title: valid.title,
    description: valid.description || undefined,
    location: valid.location || undefined,
    startsAt: valid.startsAt,
    endsAt: valid.startsAt + valid.durationMinutes * 60_000,
    createdBy,
  };
};
