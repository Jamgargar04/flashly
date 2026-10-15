import {
  addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp, type Firestore,
} from 'firebase/firestore';

import { sanitizeMessage, type ChatMessage, type NewChatMessage } from '@/domain/chat-message';
import type { ChatRepository, ErrorListener, Unsubscribe } from '@/domain/ports';

const COLLECTION = 'campusChat';

/**
 * Chat público del campus en tiempo real. Firestore muestra al instante los mensajes propios
 * (escritura local) y avisa cuando el servidor los confirma (`pending` pasa a false).
 */
export class FirestoreChatRepository implements ChatRepository {
  constructor(private readonly db: Firestore) {}

  subscribe(onChange: (messages: ChatMessage[]) => void, onError: ErrorListener): Unsubscribe {
    const q = query(collection(this.db, COLLECTION), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snap) => {
        const now = Date.now();
        onChange(
          snap.docs.map((d) => {
            const data = d.data({ serverTimestamps: 'estimate' });
            return {
              id: d.id,
              authorId: String(data.authorId ?? ''),
              authorName: String(data.authorName ?? ''),
              authorPhoto: typeof data.authorPhoto === 'string' && data.authorPhoto ? data.authorPhoto : undefined,
              text: String(data.text ?? ''),
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : now,
              pending: d.metadata.hasPendingWrites,
            };
          }),
        );
      },
      onError,
    );
  }

  async send(message: NewChatMessage): Promise<void> {
    await addDoc(collection(this.db, COLLECTION), {
      authorId: message.authorId,
      authorName: message.authorName.slice(0, 60),
      authorPhoto: message.authorPhoto ?? null,
      text: sanitizeMessage(message.text),
      createdAt: serverTimestamp(),
    });
  }

  async remove(messageId: string): Promise<void> {
    await deleteDoc(doc(this.db, COLLECTION, messageId));
  }
}
