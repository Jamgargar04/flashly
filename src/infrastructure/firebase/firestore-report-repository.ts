import { addDoc, collection, serverTimestamp, type Firestore } from 'firebase/firestore';

import type { ReportInput, ReportRepository } from '@/domain/ports';

/** Reportes de contenido para moderación (colección "reports", solo la leen los admins). */
export class FirestoreReportRepository implements ReportRepository {
  constructor(private readonly db: Firestore) {}

  async report(input: ReportInput): Promise<void> {
    await addDoc(collection(this.db, 'reports'), { ...input, createdAt: serverTimestamp() });
  }
}
