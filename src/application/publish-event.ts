import { buildEvent, type EventDraft } from '@/domain/event';
import type { EventRepository, PhotoCompressor, PhotoStorage } from '@/domain/ports';

import type { PublishStep } from './publish-moment';

export const COVER_WIDTH = 1280;

export type PublishEventDeps = {
  compressor: PhotoCompressor;
  photos: PhotoStorage;
  events: EventRepository;
  now?: () => number;
};

export type PublishEventInput = { draft: EventDraft; coverUri?: string | null; createdBy: string };

/**
 * Caso de uso "Publicar evento": valida primero (para no subir una portada en vano),
 * luego comprime y sube la portada real a la nube y guarda el evento.
 */
export const createPublishEvent = ({ compressor, photos, events, now = Date.now }: PublishEventDeps) =>
  async (input: PublishEventInput, onProgress?: (step: PublishStep) => void): Promise<void> => {
    const event = buildEvent(input.draft, input.createdBy, now());

    let imageUrl: string | undefined;
    if (input.coverUri) {
      onProgress?.('compress');
      const cover = await compressor.compress(input.coverUri, COVER_WIDTH);
      onProgress?.('upload');
      imageUrl = await photos.upload(cover, { folder: 'flashly/events', name: `event-${now()}` });
    }

    onProgress?.('save');
    await events.create({ ...event, imageUrl });
  };
