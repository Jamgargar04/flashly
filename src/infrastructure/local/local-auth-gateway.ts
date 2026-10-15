import { DomainError } from '@/domain/domain-error';
import type { AuthGateway, KeyValueStore, ProfileUpdate, Unsubscribe } from '@/domain/ports';
import type { SignInInput, SignUpInput, Student } from '@/domain/student';

type LocalAccounts = Record<string, { name: string; group: string; bio?: string }>;

const ACCOUNTS = 'flashly.local.accounts';
const SESSION = 'flashly.local.session';

const toStudent = (email: string, account: LocalAccounts[string]): Student => ({
  uid: 'local-' + email, email, name: account.name, group: account.group, bio: account.bio, verified: true,
});

/** Modo demostración: cuentas guardadas solo en el teléfono, sin contraseñas almacenadas. */
export class LocalAuthGateway implements AuthGateway {
  private listener: ((student: Student | null) => void) | null = null;

  constructor(private readonly store: KeyValueStore) {}

  observe(listener: (student: Student | null) => void): Unsubscribe {
    this.listener = listener;
    void this.restore();
    return () => {
      this.listener = null;
    };
  }

  async signIn({ email }: SignInInput): Promise<void> {
    const accounts = await this.store.get<LocalAccounts>(ACCOUNTS, {});
    const account = accounts[email];
    if (!account) throw new DomainError('No encontramos una cuenta con ese correo en este teléfono. Crea una.', 'auth/user-not-found');
    await this.store.set(SESSION, email);
    this.emit(toStudent(email, account));
  }

  async signUp({ name, group, email }: SignUpInput): Promise<Student> {
    const accounts = await this.store.get<LocalAccounts>(ACCOUNTS, {});
    accounts[email] = { name, group };
    await this.store.set(ACCOUNTS, accounts);
    await this.store.set(SESSION, email);
    const student = toStudent(email, accounts[email]);
    this.emit(student);
    return student;
  }

  async signOut(): Promise<void> {
    await this.store.remove(SESSION);
    this.emit(null);
  }

  async refreshVerification(): Promise<boolean> {
    return true;
  }

  async resendVerification(): Promise<void> {
    return undefined;
  }

  async updateProfile({ name, bio, group }: ProfileUpdate): Promise<void> {
    const email = await this.store.get<string | null>(SESSION, null);
    if (!email) throw new DomainError('No hay sesión activa.', 'auth');
    const accounts = await this.store.get<LocalAccounts>(ACCOUNTS, {});
    if (!accounts[email]) return;
    accounts[email] = {
      ...accounts[email],
      name,
      ...(group !== undefined && { group }),
      ...(bio !== undefined && { bio }),
    };
    await this.store.set(ACCOUNTS, accounts);
    this.emit(toStudent(email, accounts[email]));
  }

  private async restore(): Promise<void> {
    const email = await this.store.get<string | null>(SESSION, null);
    const accounts = await this.store.get<LocalAccounts>(ACCOUNTS, {});
    this.emit(email && accounts[email] ? toStudent(email, accounts[email]) : null);
  }

  private emit(student: Student | null): void {
    this.listener?.(student);
  }
}
