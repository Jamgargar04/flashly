import { collection, getDocs, type Firestore } from 'firebase/firestore';

import type { CampusDirectory, Classmate } from '@/domain/ports';

/** Lee los usuarios registrados en Firestore y los expone como compañeros de campus. */
export class FirestoreCampusDirectory implements CampusDirectory {
  constructor(private readonly db: Firestore) {}

  async listClassmates(): Promise<Classmate[]> {
    const snap = await getDocs(collection(this.db, 'users'));
    return snap.docs.map((d) => ({
      id: d.id,
      name: String(d.data().name ?? ''),
      group: String(d.data().group ?? ''),
    }));
  }
}
