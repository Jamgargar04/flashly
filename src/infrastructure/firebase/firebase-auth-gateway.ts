import {
  createUserWithEmailAndPassword, onAuthStateChanged, reload, sendEmailVerification,
  signInWithEmailAndPassword, signOut, updateProfile as setDisplayName, type Auth, type User,
} from '@firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc, type Firestore } from 'firebase/firestore';

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

/** Adaptador de autenticación con Firebase Authentication + perfil en Firestore. */
export class FirebaseAuthGateway implements AuthGateway {
  constructor(private readonly auth: Auth, private readonly db: Firestore) {}

  observe(listener: (student: Student | null) => void): Unsubscribe {
    return onAuthStateChanged(this.auth, async (user) => {
      if (!user) return listener(null);
      listener(await this.toStudent(user));
    });
  }

  async signIn({ email, password }: SignInInput): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async signUp({ name, group, email, password }: SignUpInput): Promise<Student> {
    try {
      const { user } = await createUserWithEmailAndPassword(this.auth, email, password);
      await setDisplayName(user, { displayName: name });
      await setDoc(doc(this.db, 'users', user.uid), { name, group, email, createdAt: serverTimestamp() });
      await sendEmailVerification(user);
      return { uid: user.uid, email, name, group, verified: false };
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async updateProfile({ name, bio, group }: ProfileUpdate): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new DomainError('No hay sesión activa.', 'auth');
    try {
      await setDisplayName(user, { displayName: name });
      const data: Record<string, unknown> = { name };
      if (group !== undefined) data.group = group;
      if (bio !== undefined) data.bio = bio;
      await updateDoc(doc(this.db, 'users', user.uid), data);
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
    await user.getIdToken(true);
    return user.emailVerified;
  }

  async resendVerification(): Promise<void> {
    if (this.auth.currentUser) await sendEmailVerification(this.auth.currentUser);
  }

  private async toStudent(user: User): Promise<Student> {
    const base: Student = { uid: user.uid, email: user.email ?? '', name: user.displayName ?? '', group: '', verified: user.emailVerified };
    try {
      const snap = await getDoc(doc(this.db, 'users', user.uid));
      if (!snap.exists()) return base;
      const d = snap.data();
      return { ...base, name: String(d.name ?? base.name), group: String(d.group ?? ''), bio: d.bio ? String(d.bio) : undefined, isAdmin: d.isAdmin === true };
    } catch {
      return base;
    }
  }
}
