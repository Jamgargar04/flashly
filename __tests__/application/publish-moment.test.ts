import { createPublishMoment, PHOTO_WIDTH, type PublishMomentInput } from '@/application/publish-moment';
import type { NewMoment } from '@/domain/moment';
import type { MomentRepository, PhotoTarget } from '@/domain/ports';

const makeDeps = (alreadyPublished = false) => {
  const saved: NewMoment[] = [];
  const compressor = { compress: jest.fn(async (uri: string, width: number) => `${uri}?w=${width}`) };
  const photos = { upload: jest.fn(async (_uri: string, t: PhotoTarget) => `https://cdn.test/${t.folder}/${t.name}.jpg`) };
  const moments: MomentRepository = {
    hasPublished: jest.fn(async () => alreadyPublished),
    save: jest.fn(async (m: NewMoment) => {
      saved.push(m);
    }),
    observeDay: jest.fn(() => () => undefined),
    toggleLike: jest.fn(async () => undefined),
    delete: jest.fn(async () => undefined),
  };
  return { compressor, photos, moments, saved };
};

const input: PublishMomentInput = {
  author: { uid: 'u1', name: 'Ana Ruiz', group: '10-A' },
  day: '2026-10-13',
  phase: 'open',
  backUri: 'file://back.jpg',
  frontUri: 'file://front.jpg',
  caption: '  En la biblioteca  ',
};

describe('caso de uso: publicar mi momento', () => {
  it('comprime, sube las dos fotos y guarda el momento', async () => {
    const deps = makeDeps();
    await createPublishMoment(deps)(input);

    expect(deps.compressor.compress).toHaveBeenCalledWith('file://back.jpg', PHOTO_WIDTH.back);
    expect(deps.compressor.compress).toHaveBeenCalledWith('file://front.jpg', PHOTO_WIDTH.front);
    expect(deps.photos.upload).toHaveBeenCalledTimes(2);
    expect(deps.saved[0]).toMatchObject({
      id: '2026-10-13_u1',
      backUrl: 'https://cdn.test/flashly/2026-10-13/u1/back.jpg',
      frontUrl: 'https://cdn.test/flashly/2026-10-13/u1/front.jpg',
      caption: 'En la biblioteca',
      late: false,
    });
  });

  it('marca como tarde lo que se publica después de la ventana', async () => {
    const deps = makeDeps();
    await createPublishMoment(deps)({ ...input, phase: 'closed' });
    expect(deps.saved[0].late).toBe(true);
  });

  it('no sube nada si ya publicaste hoy', async () => {
    const deps = makeDeps(true);
    await expect(createPublishMoment(deps)(input)).rejects.toThrow('Ya publicaste');
    expect(deps.photos.upload).not.toHaveBeenCalled();
  });

  it('no guarda el momento si falla la subida de una foto', async () => {
    const deps = makeDeps();
    deps.photos.upload.mockRejectedValueOnce(new Error('Sin conexión'));
    await expect(createPublishMoment(deps)(input)).rejects.toThrow('Sin conexión');
    expect(deps.moments.save).not.toHaveBeenCalled();
  });
});
