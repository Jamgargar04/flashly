import type { ChatMessage } from '@/domain/chat-message';
import type { ChatRepository, Unsubscribe } from '@/domain/ports';

/** Chat vacío en modo demostración. */
export class LocalChatRepository implements ChatRepository {
  subscribe(onChange: (messages: ChatMessage[]) => void): Unsubscribe {
    onChange([]);
    return () => undefined;
  }
  async send(_authorId: string, _authorName: string, _text: string): Promise<void> {}
}
