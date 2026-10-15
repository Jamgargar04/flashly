import { isSameDay } from './event-schedule';

/** Mensaje del chat público del campus. `pending` indica que aún no llega al servidor. */
export type ChatMessage = {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  createdAt: number;
  pending?: boolean;
};

export type NewChatMessage = Pick<ChatMessage, 'authorId' | 'authorName' | 'authorPhoto' | 'text'>;

export const CHAT_MAX = 200;
/** Mensajes seguidos de la misma persona con menos de 5 minutos de diferencia se agrupan. */
export const GROUP_GAP_MS = 5 * 60_000;

/** Quita espacios de más y saltos de línea repetidos; respeta el límite de caracteres. */
export const sanitizeMessage = (text: string): string =>
  text
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, CHAT_MAX);

export type ChatRow =
  | { kind: 'message'; key: string; message: ChatMessage; mine: boolean; first: boolean; last: boolean }
  | { kind: 'day'; key: string; at: number };

const together = (older: ChatMessage, newer: ChatMessage): boolean =>
  older.authorId === newer.authorId &&
  newer.createdAt - older.createdAt <= GROUP_GAP_MS &&
  isSameDay(older.createdAt, newer.createdAt);

/**
 * Filas para una lista invertida (la más nueva primero), como en iMessage:
 * marca el primer y el último mensaje de cada grupo y agrega un separador por día.
 */
export const buildChatRows = (messages: ChatMessage[], uid: string): ChatRow[] => {
  const rows: ChatRow[] = [];
  messages.forEach((message, i) => {
    const newer = messages[i - 1];
    const older = messages[i + 1];
    rows.push({
      kind: 'message',
      key: message.id,
      message,
      mine: message.authorId === uid,
      first: !older || !together(older, message),
      last: !newer || !together(message, newer),
    });
    if (!older || !isSameDay(older.createdAt, message.createdAt)) {
      rows.push({ kind: 'day', key: `day-${message.id}`, at: message.createdAt });
    }
  });
  return rows;
};

/** Mensajes de otras personas que llegaron después de la última vez que abriste el chat. */
export const countUnread = (messages: ChatMessage[], uid: string, lastSeenAt: number): number =>
  messages.filter((message) => message.authorId !== uid && message.createdAt > lastSeenAt).length;
