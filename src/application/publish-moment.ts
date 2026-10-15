import type { WindowPhase } from '@/domain/flash-window';
import { assertCanPublish, isLate, momentId, sanitizeCaption } from '@/domain/moment';
import type { MomentRepository, PhotoCompressor, PhotoStorage } from '@/domain/ports';
import type { Student } from '@/domain/student';

export const PHOTO_WIDTH = { back: 1080, front: 540 } as const;

export type PublishStep = 'compress' | 'upload' | 'save';

export type PublishMomentDeps = { compressor: PhotoCompressor; photos: PhotoStorage; moments: MomentRepository };

export type PublishMomentInput = {
  author: Pick<Student, 'uid' | 'name' | 'group' | 'photoUrl'>;
  day: string;
  phase: WindowPhase;
  backUri: string;
  frontUri: string;
  caption: string;
  location?: string;
};

/**
 * Caso de uso "Publicar mi momento": valida la regla de negocio, comprime, sube las dos fotos
 * y guarda el momento. Recibe sus dependencias (inyección), así se prueba sin Firebase ni Cloudinary.
 * `onProgress` permite mostrar en qué paso va.
 */
export const createPublishMoment = ({ compressor, photos, moments }: PublishMomentDeps) =>
  async (input: PublishMomentInput, onProgress?: (step: PublishStep) => void): Promise<void> => {
    const { author, day, phase } = input;
    assertCanPublish(phase, await moments.hasPublished(day, author.uid));

    onProgress?.('compress');
    const [back, front] = await Promise.all([
      compressor.compress(input.backUri, PHOTO_WIDTH.back),
      compressor.compress(input.frontUri, PHOTO_WIDTH.front),
    ]);

    onProgress?.('upload');
    const folder = `flashly/${day}/${author.uid}`;
    const [backUrl, frontUrl] = await Promise.all([
      photos.upload(back, { folder, name: 'back' }),
      photos.upload(front, { folder, name: 'front' }),
    ]);

    onProgress?.('save');
    await moments.save({
      id: momentId(day, author.uid),
      day,
      authorId: author.uid,
      authorName: author.name,
      authorGroup: author.group,
      authorPhoto: author.photoUrl,
      backUrl,
      frontUrl,
      caption: sanitizeCaption(input.caption),
      location: input.location,
      late: isLate(phase),
    });
  };
