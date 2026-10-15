import { collection, limit, onSnapshot, query, type Firestore } from 'firebase/firestore';

import type { Classmate } from '@/domain/classmate';
import type { CampusDirectory, ErrorListener, Unsubscribe } from '@/domain/ports';

/** Personas registradas en Flashly (colección "users"), en tiempo real. */
export class FirestoreCampusDirectory implements CampusDirectory {
  constructor(private readonly db: Firestore) {}

  observe(onChange: (people: Classmate[]) => void, onError: ErrorListener): Unsubscribe {
    return onSnapshot(
      query(collection(this.db, 'users'), limit(500)),
      (snap) =>
        onChange(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: String(data.name ?? ''),
              group: String(data.group ?? ''),
              bio: data.bio ? String(data.bio) : undefined,
              photoUrl: typeof data.photoUrl === 'string' && data.photoUrl ? data.photoUrl : undefined,
            };
          }),
        ),
      onError,
    );
  }
}
