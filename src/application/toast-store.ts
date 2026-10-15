import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';
export type Toast = { id: number; message: string; tone: ToastTone };

type ToastState = { current: Toast | null; show: (message: string, tone?: ToastTone) => void; hide: (id: number) => void };

let nextId = 1;

/** Avisos breves que aparecen arriba y se van solos (confirmaciones y errores sin interrumpir). */
export const useToast = create<ToastState>()((set) => ({
  current: null,
  show: (message, tone = 'info') => set({ current: { id: nextId++, message, tone } }),
  hide: (id) => set((state) => (state.current?.id === id ? { current: null } : state)),
}));

export const toast = {
  success: (message: string) => useToast.getState().show(message, 'success'),
  error: (message: string) => useToast.getState().show(message, 'error'),
  info: (message: string) => useToast.getState().show(message, 'info'),
};
