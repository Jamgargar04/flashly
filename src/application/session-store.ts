import { create } from 'zustand';

import type { ProfileUpdate, Unsubscribe } from '@/domain/ports';
import { parseOrThrow, signInSchema, signUpSchema, type Student } from '@/domain/student';
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
      stop = services.auth.observe((student) => set({ student, ready: true }));
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

  updateProfile: async (data) => {
    await services.auth.updateProfile(data);
    set((state) => ({ student: state.student ? { ...state.student, ...data } : null }));
  },

  setWindowOverride: async (start) => {
    if (start === null) await services.store.remove(PREFERENCES.windowOverride);
    else await services.store.set(PREFERENCES.windowOverride, start);
    set({ windowOverride: start });
  },
}));
