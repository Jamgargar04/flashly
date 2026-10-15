import { arrayRemove, arrayUnion, collection, doc, onSnapshot, query, updateDoc, where, type Firestore } from 'firebase/firestore';

import type { SocialGraph, Unsubscribe } from '@/domain/ports';

/** "Seguir" guardado en tu perfil (users/{uid}.following), sincronizado entre teléfonos. */
export class FirestoreSocialGraph implements SocialGraph {
  constructor(private readonly db: Firestore) {}

  observeFollowing(uid: string, onChange: (ids: string[]) => void): Unsubscribe {
    return onSnapshot(
      doc(this.db, 'users', uid),
      (snap) => {
        const following = snap.data()?.following;
        onChange(Array.isArray(following) ? following.map(String) : []);
      },
      () => onChange([]),
    );
  }

  observeFollowers(uid: string, onChange: (count: number) => void): Unsubscribe {
    return onSnapshot(
      query(collection(this.db, 'users'), where('following', 'array-contains', uid)),
      (snap) => onChange(snap.size),
      () => onChange(0),
    );
  }

  async setFollowing(uid: string, targetId: string, follow: boolean): Promise<void> {
    await updateDoc(doc(this.db, 'users', uid), { following: follow ? arrayUnion(targetId) : arrayRemove(targetId) });
  }
}
