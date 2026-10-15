import {
  arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, limit, onSnapshot, orderBy, query,
  serverTimestamp, setDoc, Timestamp, updateDoc, where, type DocumentSnapshot, type Firestore,
} from 'firebase/firestore';

import { momentId, MOMENT_TTL_MS, type Moment, type NewMoment } from '@/domain/moment';
import type { ErrorListener, MomentRepository, Unsubscribe } from '@/domain/ports';

const COLLECTION = 'moments';

const millis = (value: unknown, fallback: number): number =>
  value instanceof Timestamp ? value.toMillis() : fallback;

/** Convierte el documento en un momento; devuelve null si ya expiró (el borrado TTL puede tardar). */
const toMoment = (snap: DocumentSnapshot, now: number): Moment | null => {
  // "estimate": mientras el servidor confirma, usa la hora local en lugar de null.
  const data = snap.data({ serverTimestamps: 'estimate' });
  if (!data) return null;
  if (millis(data.expiresAt, now + 1) <= now) return null;
  return {
    id: snap.id,
    authorId: String(data.authorId),
    authorName: String(data.authorName ?? ''),
    authorGroup: data.authorGroup ? String(data.authorGroup) : undefined,
    avatar: typeof data.authorPhoto === 'string' && data.authorPhoto ? { uri: data.authorPhoto } : undefined,
    back: { uri: String(data.backUrl) },
    front: { uri: String(data.frontUrl) },
    caption: String(data.caption ?? ''),
    location: data.location ? String(data.location) : undefined,
    createdAt: millis(data.createdAt, now),
    late: Boolean(data.late),
    likes: Array.isArray(data.likes) ? (data.likes as string[]) : [],
  };
};

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
      authorPhoto: moment.authorPhoto ?? null,
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

  observeOwn(day: string, uid: string, onChange: (moment: Moment | null) => void, onError: ErrorListener): Unsubscribe {
    return onSnapshot(
      doc(this.db, COLLECTION, momentId(day, uid)),
      (snap) => onChange(snap.exists() ? toMoment(snap, Date.now()) : null),
      onError,
    );
  }

  observeDay(day: string, _windowStart: number, onChange: (moments: Moment[]) => void, onError: ErrorListener): Unsubscribe {
    const q = query(collection(this.db, COLLECTION), where('windowId', '==', day), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snap) => {
        const now = Date.now();
        onChange(snap.docs.map((d) => toMoment(d, now)).filter((m): m is Moment => m !== null));
      },
      onError,
    );
  }

  async toggleLike(moment: Moment, uid: string): Promise<void> {
    const liked = moment.likes.includes(uid);
    await updateDoc(doc(this.db, COLLECTION, moment.id), { likes: liked ? arrayRemove(uid) : arrayUnion(uid) });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.db, COLLECTION, id));
  }
}
