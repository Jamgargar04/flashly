import { sanitizeMessage, type ChatMessage, type NewChatMessage } from '@/domain/chat-message';
import type { ChatRepository, ErrorListener, Unsubscribe } from '@/domain/ports';

import { DEMO_CLASSMATES } from './demo-content';
import { LocalChangeNotifier } from './local-change-notifier';

const demoMessages = (now: number): ChatMessage[] => [
  { id: 'demo-3', authorId: DEMO_CLASSMATES[2].id, authorName: DEMO_CLASSMATES[2].name, text: 'Hay chilaquiles en la cafetería 🔥', createdAt: now - 4 * 60_000 },
  { id: 'demo-2', authorId: DEMO_CLASSMATES[1].id, authorName: DEMO_CLASSMATES[1].name, text: 'Yo voy saliendo del laboratorio, los alcanzo', createdAt: now - 9 * 60_000 },
  { id: 'demo-1', authorId: DEMO_CLASSMATES[0].id, authorName: DEMO_CLASSMATES[0].name, text: '¿Alguien en la biblioteca? Necesito equipo para el proyecto', createdAt: now - 10 * 60_000 },
];

/** Chat en memoria para el modo demostración, con algunos mensajes de ejemplo. */
export class LocalChatRepository implements ChatRepository {
  private messages: ChatMessage[] = demoMessages(Date.now());
  private readonly changes = new LocalChangeNotifier();

  subscribe(onChange: (messages: ChatMessage[]) => void, _onError: ErrorListener): Unsubscribe {
    const emit = () => onChange(this.messages);
    emit();
    return this.changes.subscribe(emit);
  }

  async send(message: NewChatMessage): Promise<void> {
    this.messages = [{ ...message, text: sanitizeMessage(message.text), id: `local-${Date.now()}`, createdAt: Date.now() }, ...this.messages];
    this.changes.notify();
  }

  async remove(messageId: string): Promise<void> {
    this.messages = this.messages.filter((message) => message.id !== messageId);
    this.changes.notify();
  }
}
