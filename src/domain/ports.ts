import type { Moment, NewMoment, PhotoSource } from './moment';
import type { SignInInput, SignUpInput, Student } from './student';

/**
 * Puertos (interfaces) que el dominio y la aplicación necesitan.
 * La infraestructura los implementa: Firebase, Cloudinary o almacenamiento local.
 */
export type Unsubscribe = () => void;

export interface AuthGateway {
  observe(listener: (student: Student | null) => void): Unsubscribe;
  signIn(input: SignInInput): Promise<void>;
  signUp(input: SignUpInput): Promise<Student>;
  signOut(): Promise<void>;
  refreshVerification(): Promise<boolean>;
  resendVerification(): Promise<void>;
}

export interface MomentRepository {
  hasPublished(day: string, uid: string): Promise<boolean>;
  save(moment: NewMoment): Promise<void>;
  observeDay(day: string, windowStart: number, onChange: (moments: Moment[]) => void, onError: (error: Error) => void): Unsubscribe;
  toggleLike(moment: Moment, uid: string): Promise<void>;
  delete(momentId: string): Promise<void>;
}

export type PhotoTarget = { folder: string; name: 'back' | 'front' };

export interface PhotoStorage {
  /** Sube una foto local y devuelve la URL pública. */
  upload(localUri: string, target: PhotoTarget): Promise<string>;
}

export interface PhotoCompressor {
  compress(localUri: string, maxWidth: number): Promise<string>;
}

export interface KeyValueStore {
  get<T>(key: string, fallback: T): Promise<T>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

export type Classmate = { id: string; name: string; group: string; avatar?: PhotoSource };

export interface CampusDirectory {
  listClassmates(): Promise<Classmate[]>;
}

export interface ReminderScheduler {
  requestPermission(): Promise<boolean>;
  /** Programa el aviso sorpresa de los próximos días. */
  scheduleUpcoming(days?: number): Promise<void>;
  remindIn(seconds: number): Promise<void>;
  cancelAll(): Promise<void>;
}
