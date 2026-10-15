import {
  addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp, where,
  type DocumentData, type Firestore,
} from 'firebase/firestore';

import { upcomingEvents, type CampusEvent, type NewCampusEvent } from '@/domain/event';
import type { ErrorListener, EventRepository, Unsubscribe } from '@/domain/ports';

const COLLECTION = 'events';

const toEvent = (id: string, data: DocumentData): CampusEvent | null => {
  if (!(data.startsAt instanceof Timestamp) || !(data.endsAt instanceof Timestamp)) return null;
  return {
    id,
    title: String(data.title ?? ''),
    description: data.description ? String(data.description) : undefined,
    imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
    location: data.location ? String(data.location) : undefined,
    startsAt: data.startsAt.toMillis(),
    endsAt: data.endsAt.toMillis(),
    createdBy: String(data.createdBy ?? ''),
  };
};

/**
 * Eventos del campus en tiempo real. Solo trae los que no han terminado
 * (un filtro y un orden sobre el mismo campo: no necesita índice compuesto).
 */
export class FirestoreEventRepository implements EventRepository {
  constructor(private readonly db: Firestore) {}

  observeUpcoming(onChange: (events: CampusEvent[]) => void, onError: ErrorListener): Unsubscribe {
    const q = query(collection(this.db, COLLECTION), where('endsAt', '>', Timestamp.now()), orderBy('endsAt', 'asc'), limit(40));
    return onSnapshot(
      q,
      (snap) => {
        const events = snap.docs.map((d) => toEvent(d.id, d.data())).filter((e): e is CampusEvent => e !== null);
        onChange(upcomingEvents(events, Date.now()));
      },
      onError,
    );
  }

  async create(event: NewCampusEvent): Promise<void> {
    // Firestore no acepta undefined: los campos opcionales vacíos se guardan como null.
    await addDoc(collection(this.db, COLLECTION), {
      title: event.title,
      description: event.description ?? null,
      location: event.location ?? null,
      imageUrl: event.imageUrl ?? null,
      startsAt: Timestamp.fromMillis(event.startsAt),
      endsAt: Timestamp.fromMillis(event.endsAt),
      createdBy: event.createdBy,
      createdAt: serverTimestamp(),
    });
  }

  async remove(eventId: string): Promise<void> {
    await deleteDoc(doc(this.db, COLLECTION, eventId));
  }
}
