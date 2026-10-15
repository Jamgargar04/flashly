import {
  arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, limit, onSnapshot, orderBy, query,
  serverTimestamp, setDoc, Timestamp, updateDoc, where, type DocumentData, type Firestore,
} from 'firebase/firestore';

import { momentId, MOMENT_TTL_MS, type Moment, type NewMoment } from '@/domain/moment';
import type { MomentRepository, Unsubscribe } from '@/domain/ports';

const COLLECTION = 'moments';

const toMoment = (id: string, data: DocumentData, now: number): Moment & { expiresAt: number } => ({
  id,
  authorId: String(data.authorId),
  authorName: String(data.authorName ?? ''),
  authorGroup: data.authorGroup ? String(data.authorGroup) : undefined,
  back: { uri: String(data.backUrl) },
  front: { uri: String(data.frontUrl) },
  caption: String(data.caption ?? ''),
  location: data.location ? String(data.location) : undefined,
  createdAt: data.createdAt?.toMillis?.() ?? now,
  late: Boolean(data.late),
  likes: Array.isArray(data.likes) ? (data.likes as string[]) : [],
  expiresAt: data.expiresAt?.toMillis?.() ?? now + 1,
});

/** Repositorio de momentos en Cloud Firestore, con actualizaciones en tiempo real. */
export class FirestoreMomentRepository implements MomentRepository {
  constructor(private readonly db: Firestore) {}

  async hasPublished(day: string, uid: string): Promise<boolean> {
    const snap = await getDoc(doc(this.db, COLLECTION, momentId(day, uid)));
    return snap.exists();
  }

  async save(moment: NewMoment): Promise<void> {
    await setDoc(doc(this.db, COLLECTION, moment.id), {
      authorId: moment.authorId,
      authorName: moment.authorName,
      authorGroup: moment.authorGroup,
      windowId: moment.day,
      backUrl: moment.backUrl,
      frontUrl: moment.frontUrl,
      caption: moment.caption,
      location: moment.location ?? null,
      late: moment.late,
      likes: [],
      createdAt: serverTimestamp(),
      // Campo de la política TTL de Firestore: borra el documento a las 24 h.
      expiresAt: Timestamp.fromMillis(Date.now() + MOMENT_TTL_MS),
    });
  }

  observeDay(day: string, _windowStart: number, onChange: (moments: Moment[]) => void, onError: (error: Error) => void): Unsubscribe {
    const q = query(collection(this.db, COLLECTION), where('windowId', '==', day), orderBy('createdAt', 'desc'), limit(60));
    return onSnapshot(
      q,
      (snap) => {
        const now = Date.now();
        // El borrado TTL puede tardar; aquí se ocultan al instante los que ya expiraron.
        const moments = snap.docs
          .map((d) => toMoment(d.id, d.data(), now))
          .filter((m) => m.expiresAt > now)
          .map(({ expiresAt: _expiresAt, ...m }) => m);
        onChange(moments);
      },
      onError,
    );
  }

  async toggleLike(moment: Moment, uid: string): Promise<void> {
    const liked = moment.likes.includes(uid);
    await updateDoc(doc(this.db, COLLECTION, moment.id), { likes: liked ? arrayRemove(uid) : arrayUnion(uid) });
  }

  async delete(momentId: string): Promise<void> {
    await deleteDoc(doc(this.db, COLLECTION, momentId));
  }
}
