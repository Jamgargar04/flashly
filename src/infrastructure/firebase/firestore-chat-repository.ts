import {
  addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp, type Firestore,
} from 'firebase/firestore';

import type { ChatMessage } from '@/domain/chat-message';
import type { ChatRepository, Unsubscribe } from '@/domain/ports';

const COLLECTION = 'campusChat';

/** Chat público del campus en tiempo real con Firestore. */
export class FirestoreChatRepository implements ChatRepository {
  constructor(private readonly db: Firestore) {}

  subscribe(onChange: (messages: ChatMessage[]) => void): Unsubscribe {
    const q = query(collection(this.db, COLLECTION), orderBy('createdAt', 'desc'), limit(80));
    return onSnapshot(q, (snap) => {
      const messages: ChatMessage[] = snap.docs.map((d) => ({
        id: d.id,
        authorId: String(d.data().authorId ?? ''),
        authorName: String(d.data().authorName ?? ''),
        text: String(d.data().text ?? ''),
        createdAt: d.data().createdAt?.toMillis?.() ?? Date.now(),
      }));
      onChange(messages);
    });
  }

  async send(authorId: string, authorName: string, text: string): Promise<void> {
    await addDoc(collection(this.db, COLLECTION), {
      authorId,
      authorName,
      text: text.trim().slice(0, 200),
      createdAt: serverTimestamp(),
    });
  }
}
