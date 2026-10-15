import { createChangeAvatar } from '@/application/change-avatar';
import { COVER_WIDTH, createPublishEvent } from '@/application/publish-event';
import type { NewCampusEvent } from '@/domain/event';
import type { EventRepository, PhotoTarget } from '@/domain/ports';

const NOW = new Date(2026, 9, 15, 10, 0).getTime();
const START = new Date(2026, 9, 16, 13, 0).getTime();

const makeDeps = () => {
  const created: NewCampusEvent[] = [];
  const compressor = { compress: jest.fn(async (uri: string, width: number) => `${uri}?w=${width}`) };
  const photos = { upload: jest.fn(async (_uri: string, t: PhotoTarget) => `https://cdn.test/${t.folder}/${t.name}.jpg`) };
  const events: EventRepository = {
    observeUpcoming: jest.fn(() => () => undefined),
    create: jest.fn(async (event: NewCampusEvent) => {
      created.push(event);
    }),
    remove: jest.fn(async () => undefined),
  };
  return { compressor, photos, events, created, now: () => NOW };
};

const draft = { title: 'Torneo relámpago', description: 'Trae tenis', location: 'Cancha', startsAt: START, durationMinutes: 120 };

describe('caso de uso: publicar evento', () => {
  it('sube la portada real y guarda el evento con su URL', async () => {
    const deps = makeDeps();
    const steps: string[] = [];
    await createPublishEvent(deps)({ draft, coverUri: 'file://cover.jpg', createdBy: 'admin' }, (step) => steps.push(step));

    expect(deps.compressor.compress).toHaveBeenCalledWith('file://cover.jpg', COVER_WIDTH);
    expect(deps.created[0]).toMatchObject({
      title: 'Torneo relámpago',
      imageUrl: `https://cdn.test/flashly/events/event-${NOW}.jpg`,
      startsAt: START,
      endsAt: START + 2 * 60 * 60_000,
      createdBy: 'admin',
    });
    expect(steps).toEqual(['compress', 'upload', 'save']);
  });

  it('publica sin portada si no se eligió una', async () => {
    const deps = makeDeps();
    await createPublishEvent(deps)({ draft, coverUri: null, createdBy: 'admin' });
    expect(deps.photos.upload).not.toHaveBeenCalled();
    expect(deps.created[0].imageUrl).toBeUndefined();
  });

  it('valida antes de subir: un error no desperdicia la subida', async () => {
    const deps = makeDeps();
    await expect(createPublishEvent(deps)({ draft: { ...draft, title: 'x' }, coverUri: 'file://cover.jpg', createdBy: 'admin' })).rejects.toThrow();
    expect(deps.photos.upload).not.toHaveBeenCalled();
    expect(deps.events.create).not.toHaveBeenCalled();
  });
});

describe('caso de uso: cambiar foto de perfil', () => {
  it('comprime, sube y guarda la URL en el perfil', async () => {
    const deps = makeDeps();
    const updateProfile = jest.fn(async () => undefined);
    const url = await createChangeAvatar({ ...deps, updateProfile })('u1', 'file://me.jpg');
    expect(url).toMatch(/^https:\/\/cdn\.test\/flashly\/avatars\/u1\/avatar-\d+\.jpg$/);
    expect(updateProfile).toHaveBeenCalledWith({ photoUrl: url });
  });
});
