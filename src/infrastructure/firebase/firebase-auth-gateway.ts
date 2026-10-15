import {
  createUserWithEmailAndPassword, onAuthStateChanged, reload, sendEmailVerification, sendPasswordResetEmail,
  signInWithEmailAndPassword, signOut, updateProfile as setDisplayName, type Auth, type User,
} from '@firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc, type DocumentData, type Firestore } from 'firebase/firestore';

import { DomainError } from '@/domain/domain-error';
import type { AuthGateway, ProfileUpdate, Unsubscribe } from '@/domain/ports';
import type { SignInInput, SignUpInput, Student } from '@/domain/student';

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'No encontramos una cuenta con ese correo.',
  'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Inicia sesión.',
  'auth/weak-password': 'La contraseña necesita al menos 8 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet.',
};

const toDomainError = (error: unknown): DomainError => {
  const code = (error as { code?: string })?.code ?? '';
  return new DomainError(AUTH_MESSAGES[code] ?? 'No pudimos completar la operación. Intenta de nuevo.', code || 'auth');
};

const text = (value: unknown): string | undefined => (typeof value === 'string' && value.trim() ? value : undefined);

const toStudent = (user: User, data?: DocumentData): Student => ({
  uid: user.uid,
  email: user.email ?? '',
  name: text(data?.name) ?? user.displayName ?? '',
  group: text(data?.group) ?? '',
  bio: text(data?.bio),
  photoUrl: text(data?.photoUrl),
  isAdmin: data?.isAdmin === true,
  verified: user.emailVerified,
});

/** Adaptador de autenticación con Firebase Authentication + perfil en Firestore (en vivo). */
export class FirebaseAuthGateway implements AuthGateway {
  /** Evita que el perfil se cree dos veces mientras signUp lo está creando. */
  private signingUp = false;

  constructor(private readonly auth: Auth, private readonly db: Firestore) {}

  observe(listener: (student: Student | null) => void): Unsubscribe {
    let stopProfile: Unsubscribe = () => undefined;
    const stopAuth = onAuthStateChanged(this.auth, (user) => {
      stopProfile();
      stopProfile = () => undefined;
      if (!user) {
        listener(null);
        return;
      }
      listener(toStudent(user));
      // El perfil se escucha en vivo: si un admin te da permisos o editas tu perfil, la app se actualiza sola.
      stopProfile = onSnapshot(
        doc(this.db, 'users', user.uid),
        (snap) => {
          if (snap.exists()) listener(toStudent(user, snap.data()));
          else if (!this.signingUp) this.createProfile(user, user.displayName ?? '', '').catch(() => undefined);
        },
        () => undefined,
      );
    });
    return () => {
      stopProfile();
      stopAuth();
    };
  }

  async signIn({ email, password }: SignInInput): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async signUp({ name, group, email, password }: SignUpInput): Promise<Student> {
    this.signingUp = true;
    try {
      const { user } = await createUserWithEmailAndPassword(this.auth, email, password);
      await setDisplayName(user, { displayName: name });
      await this.createProfile(user, name, group);
      await sendEmailVerification(user);
      return { uid: user.uid, email, name, group, verified: false };
    } catch (error) {
      throw toDomainError(error);
    } finally {
      this.signingUp = false;
    }
  }

  async updateProfile(data: ProfileUpdate): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new DomainError('No hay sesión activa.', 'auth');
    const changes = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
    if (Object.keys(changes).length === 0) return;
    try {
      if (data.name) await setDisplayName(user, { displayName: data.name });
      await updateDoc(doc(this.db, 'users', user.uid), changes);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  async refreshVerification(): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;
    await reload(user);
    // Token nuevo para que las reglas de seguridad vean el correo verificado.
    if (user.emailVerified) await user.getIdToken(true);
    return user.emailVerified;
  }

  async resendVerification(): Promise<void> {
    if (this.auth.currentUser) await sendEmailVerification(this.auth.currentUser);
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  /** Crea (o completa) el documento del perfil; también repara cuentas a las que les falta. */
  private async createProfile(user: User, name: string, group: string): Promise<void> {
    await setDoc(
      doc(this.db, 'users', user.uid),
      { name, group, email: user.email ?? '', createdAt: serverTimestamp() },
      { merge: true },
    );
  }
}
