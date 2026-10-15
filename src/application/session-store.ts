import { create } from 'zustand';

import type { ProfileUpdate, Unsubscribe } from '@/domain/ports';
import { emailSchema, parseOrThrow, signInSchema, signUpSchema, type Student } from '@/domain/student';
import { services } from '@/infrastructure/container';

import { PREFERENCES } from './preference-keys';

type SessionState = {
  ready: boolean;
  onboarded: boolean;
  student: Student | null;
  windowOverride: number | null;
};

type SessionActions = {
  start: () => Unsubscribe;
  finishOnboarding: () => Promise<void>;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signUp: (input: { name: string; group: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshVerification: () => Promise<boolean>;
  resendVerification: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<string>;
  setWindowOverride: (start: number | null) => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
};

/** Estado global de la sesión con Zustand. Las pantallas solo leen el estado y llaman acciones. */
export const useSession = create<SessionState & SessionActions>()((set) => ({
  ready: false,
  onboarded: false,
  student: null,
  windowOverride: null,

  start: () => {
    let stop: Unsubscribe = () => undefined;
    let cancelled = false;
    void (async () => {
      const [onboarded, windowOverride] = await Promise.all([
        services.store.get<boolean>(PREFERENCES.onboarded, false),
        services.store.get<number | null>(PREFERENCES.windowOverride, null),
      ]);
      if (cancelled) return;
      set({ onboarded, windowOverride });
      stop = services.auth.observe((student) =>
        // Conserva "verificado" si ya se confirmó en esta sesión (el perfil en vivo puede llegar antes del token).
        set((state) => ({
          ready: true,
          student: student && state.student?.uid === student.uid && state.student.verified ? { ...student, verified: true } : student,
        })),
      );
    })();
    return () => {
      cancelled = true;
      stop();
    };
  },

  finishOnboarding: async () => {
    await services.store.set(PREFERENCES.onboarded, true);
    set({ onboarded: true });
  },

  signIn: async (input) => {
    await services.auth.signIn(parseOrThrow(signInSchema, input));
  },

  signUp: async (input) => {
    const student = await services.auth.signUp(parseOrThrow(signUpSchema, input));
    set({ student });
  },

  signOut: async () => {
    await services.auth.signOut();
    set({ student: null });
  },

  refreshVerification: async () => {
    const verified = await services.auth.refreshVerification();
    set((state) => ({ student: state.student ? { ...state.student, verified } : null }));
    return verified;
  },

  resendVerification: () => services.auth.resendVerification(),

  /** Valida el correo, envía el enlace y devuelve el correo normalizado para el mensaje. */
  sendPasswordReset: async (email) => {
    const valid = parseOrThrow(emailSchema, { email });
    await services.auth.sendPasswordReset(valid.email);
    return valid.email;
  },

  updateProfile: async (data) => {
    await services.auth.updateProfile(data);
    // Solo los campos enviados: un `group: undefined` (maestros) no debe borrar el grupo en memoria.
    const changes = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
    set((state) => ({ student: state.student ? { ...state.student, ...changes } : null }));
  },

  setWindowOverride: async (start) => {
    if (start === null) await services.store.remove(PREFERENCES.windowOverride);
    else await services.store.set(PREFERENCES.windowOverride, start);
    set({ windowOverride: start });
  },
}));
