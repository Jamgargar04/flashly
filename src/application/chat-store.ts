import { create } from 'zustand';

import { countUnread, sanitizeMessage, type ChatMessage } from '@/domain/chat-message';
import type { Unsubscribe } from '@/domain/ports';
import type { Student } from '@/domain/student';
import { services } from '@/infrastructure/container';

import { PREFERENCES } from './preference-keys';

type ChatState = {
  messages: ChatMessage[];
  /** Mensajes que no se pudieron enviar; se muestran con opción de reintentar. */
  failed: ChatMessage[];
  loaded: boolean;
  lastSeenAt: number;
};

type ChatActions = {
  start: (uid: string) => Unsubscribe;
  send: (author: Student, text: string) => Promise<void>;
  retry: (failedId: string, author: Student) => Promise<void>;
  remove: (messageId: string) => Promise<void>;
  report: (message: ChatMessage, uid: string) => Promise<void>;
  markSeen: () => void;
};

/**
 * Chat del campus en tiempo real con una sola suscripción para toda la app:
 * alimenta la pantalla del chat y el contador de no leídos del encabezado.
 */
export const useChat = create<ChatState & ChatActions>()((set, get) => ({
  messages: [],
  failed: [],
  loaded: false,
  lastSeenAt: Date.now(),

  start: () => {
    let active = true;
    // La primera vez solo cuentan como no leídos los mensajes que lleguen desde ahora (y se recuerda).
    void services.store.get<number | null>(PREFERENCES.chatLastSeen, null).then((saved) => {
      const lastSeenAt = saved ?? Date.now();
      if (saved === null) void services.store.set(PREFERENCES.chatLastSeen, lastSeenAt);
      if (active) set({ lastSeenAt });
    });
    const stop = services.chat.subscribe(
      (messages) => set({ messages, loaded: true }),
      () => set({ loaded: true }),
    );
    return () => {
      active = false;
      stop();
    };
  },

  send: async (author, text) => {
    const clean = sanitizeMessage(text);
    if (!clean) return;
    const message = { authorId: author.uid, authorName: author.name, authorPhoto: author.photoUrl, text: clean };
    try {
      await services.chat.send(message);
    } catch {
      set((state) => ({ failed: [{ ...message, id: `failed-${Date.now()}`, createdAt: Date.now() }, ...state.failed] }));
    }
  },

  retry: async (failedId, author) => {
    const message = get().failed.find((m) => m.id === failedId);
    if (!message) return;
    set((state) => ({ failed: state.failed.filter((m) => m.id !== failedId) }));
    await get().send(author, message.text);
  },

  remove: (messageId) => {
    set((state) => ({ messages: state.messages.filter((m) => m.id !== messageId), failed: state.failed.filter((m) => m.id !== messageId) }));
    return messageId.startsWith('failed-') ? Promise.resolve() : services.chat.remove(messageId);
  },

  report: (message, uid) =>
    services.reports.report({ kind: 'message', targetId: message.id, authorId: message.authorId, reportedBy: uid }),

  markSeen: () => {
    const newest = get().messages[0]?.createdAt ?? 0;
    const lastSeenAt = Math.max(Date.now(), newest);
    set({ lastSeenAt });
    void services.store.set(PREFERENCES.chatLastSeen, lastSeenAt);
  },
}));

/** Cantidad de mensajes nuevos de otras personas desde la última visita al chat. */
export const useUnreadChat = (uid: string): number =>
  useChat((state) => countUnread(state.messages, uid, state.lastSeenAt));
