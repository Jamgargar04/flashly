import type { ChatMessage, NewChatMessage } from './chat-message';
import type { Classmate } from './classmate';
import type { CampusEvent, NewCampusEvent } from './event';
import type { Moment, NewMoment } from './moment';
import type { SignInInput, SignUpInput, Student } from './student';

/**
 * Puertos (interfaces) que el dominio y la aplicación necesitan.
 * La infraestructura los implementa: Firebase, Cloudinary, Expo o almacenamiento local.
 * Todo lo que cambia en vivo se expone como suscripción (observe/subscribe) para la UI en tiempo real.
 */
export type Unsubscribe = () => void;
export type ErrorListener = (error: Error) => void;

export type ProfileUpdate = { name?: string; bio?: string; group?: string; photoUrl?: string };

export interface AuthGateway {
  /** Emite el estudiante con su perfil actualizado cada vez que cambia (o null sin sesión). */
  observe(listener: (student: Student | null) => void): Unsubscribe;
  signIn(input: SignInInput): Promise<void>;
  signUp(input: SignUpInput): Promise<Student>;
  signOut(): Promise<void>;
  refreshVerification(): Promise<boolean>;
  resendVerification(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  updateProfile(data: ProfileUpdate): Promise<void>;
}

export interface MomentRepository {
  hasPublished(day: string, uid: string): Promise<boolean>;
  save(moment: NewMoment): Promise<void>;
  /** Tu propio momento del día (null si aún no publicas). */
  observeOwn(day: string, uid: string, onChange: (moment: Moment | null) => void, onError: ErrorListener): Unsubscribe;
  observeDay(day: string, windowStart: number, onChange: (moments: Moment[]) => void, onError: ErrorListener): Unsubscribe;
  toggleLike(moment: Moment, uid: string): Promise<void>;
  delete(momentId: string): Promise<void>;
}

export type PhotoTarget = { folder: string; name: string };

export interface PhotoStorage {
  /** Sube una foto local y devuelve la URL pública. */
  upload(localUri: string, target: PhotoTarget): Promise<string>;
}

export interface PhotoCompressor {
  compress(localUri: string, maxWidth: number): Promise<string>;
}

export interface ImagePicker {
  /** Abre la galería con recorte; devuelve la ruta local o null si la persona cancela. */
  pickImage(options: { aspect: [number, number]; circular?: boolean }): Promise<string | null>;
}

export interface KeyValueStore {
  get<T>(key: string, fallback: T): Promise<T>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface CampusDirectory {
  observe(onChange: (people: Classmate[]) => void, onError: ErrorListener): Unsubscribe;
}

export interface SocialGraph {
  observeFollowing(uid: string, onChange: (ids: string[]) => void): Unsubscribe;
  observeFollowers(uid: string, onChange: (count: number) => void): Unsubscribe;
  setFollowing(uid: string, targetId: string, follow: boolean): Promise<void>;
}

export interface EventRepository {
  /** Eventos que aún no terminan, en tiempo real. */
  observeUpcoming(onChange: (events: CampusEvent[]) => void, onError: ErrorListener): Unsubscribe;
  create(event: NewCampusEvent): Promise<void>;
  remove(eventId: string): Promise<void>;
}

export interface ChatRepository {
  /** Mensajes más recientes primero. */
  subscribe(onChange: (messages: ChatMessage[]) => void, onError: ErrorListener): Unsubscribe;
  send(message: NewChatMessage): Promise<void>;
  remove(messageId: string): Promise<void>;
}

export type ReportInput = { kind: 'moment' | 'message'; targetId: string; authorId: string; reportedBy: string };

export interface ReportRepository {
  report(input: ReportInput): Promise<void>;
}

export type NotificationContent = { title: string; body: string };

export interface ReminderScheduler {
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  /** Programa el aviso sorpresa de los próximos días (reemplaza los anteriores). */
  scheduleDailyFlash(content: NotificationContent, days?: number): Promise<void>;
  cancelDailyFlash(): Promise<void>;
  remindIn(seconds: number, content: NotificationContent): Promise<void>;
  /** Aviso único en una fecha exacta; el id permite cancelarlo después. */
  scheduleAt(id: string, at: number, content: NotificationContent): Promise<void>;
  cancel(id: string): Promise<void>;
}
