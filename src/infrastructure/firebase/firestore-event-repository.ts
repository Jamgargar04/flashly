import { collection, getDocs, orderBy, query, where, type Firestore } from 'firebase/firestore';

import type { CampusEvent } from '@/domain/event';
import type { EventRepository } from '@/domain/ports';

/** Lee la colección "events" de Firestore y devuelve los eventos activos ordenados por fecha. */
export class FirestoreEventRepository implements EventRepository {
  constructor(private readonly db: Firestore) {}

  async listUpcoming(): Promise<CampusEvent[]> {
    const q = query(
      collection(this.db, 'events'),
      where('active', '==', true),
      orderBy('date', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      title: String(d.data().title ?? ''),
      description: d.data().description ? String(d.data().description) : undefined,
      imageUrl: d.data().imageUrl ? String(d.data().imageUrl) : undefined,
      when: String(d.data().when ?? ''),
      location: d.data().location ? String(d.data().location) : undefined,
    }));
  }
}
