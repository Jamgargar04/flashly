import { DomainError } from './domain-error';
import type { WindowPhase } from './flash-window';

/** Imagen local empaquetada (require) o remota ({ uri }). */
export type PhotoSource = number | { uri: string };

export const CAPTION_MAX = 80;
export const MOMENT_TTL_MS = 24 * 60 * 60 * 1000;

/** Un "momento": la publicación diaria de un estudiante, con foto trasera y frontal. */
export type Moment = {
  id: string;
  authorId: string;
  authorName: string;
  authorGroup?: string;
  avatar?: PhotoSource;
  back: PhotoSource;
  front: PhotoSource;
  caption: string;
  createdAt: number;
  late: boolean;
  likes: string[];
};

export type NewMoment = {
  id: string;
  day: string;
  authorId: string;
  authorName: string;
  authorGroup: string;
  backUrl: string;
  frontUrl: string;
  caption: string;
  late: boolean;
};

/** Un momento por estudiante por día: el id siempre es dia_usuario. */
export const momentId = (day: string, uid: string): string => `${day}_${uid}`;

export const sanitizeCaption = (caption: string): string => caption.trim().replace(/\s+/g, ' ').slice(0, CAPTION_MAX);

/** Se puede publicar en cualquier momento del día mientras no hayas publicado ya hoy. */
export const assertCanPublish = (_phase: WindowPhase, alreadyPublished: boolean): void => {
  if (alreadyPublished) throw new DomainError('Ya publicaste tu momento de hoy.', 'already-published');
};

/** Publicar después de los 2 minutos está permitido, pero se marca como tarde. */
export const isLate = (phase: WindowPhase): boolean => phase === 'closed';

export const toggleLike = (moment: Moment, uid: string): Moment => ({
  ...moment,
  likes: moment.likes.includes(uid) ? moment.likes.filter((id) => id !== uid) : [...moment.likes, uid],
});
