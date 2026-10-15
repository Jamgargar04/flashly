import type { Moment } from '@/domain/moment';
import type { Student } from '@/domain/student';
import { LocalAuthGateway } from '@/infrastructure/local/local-auth-gateway';
import { LocalChatRepository } from '@/infrastructure/local/local-chat-repository';
import { LocalEventRepository } from '@/infrastructure/local/local-event-repository';
import { LocalMomentRepository } from '@/infrastructure/local/local-moment-repository';
import { LocalSocialGraph } from '@/infrastructure/local/local-social-graph';

import { InMemoryStore } from '../../test-support/in-memory-store';

const seed = (start: number): Moment[] => [
  { id: 'demo-1', authorId: 'd1', authorName: 'Demo', back: 1, front: 2, caption: '', createdAt: start, late: false, likes: [] },
];

const newMoment = {
  id: '2026-10-13_u1', day: '2026-10-13', authorId: 'u1', authorName: 'Ana', authorGroup: '10-A',
  backUrl: 'file://b.jpg', frontUrl: 'file://f.jpg', caption: 'hola', late: false,
};

describe('modo demostración: repositorio local de momentos', () => {
  it('recuerda que ya publicaste y muestra tu momento primero', async () => {
    const repo = new LocalMomentRepository(new InMemoryStore(), seed);
    expect(await repo.hasPublished('2026-10-13', 'u1')).toBe(false);
    await repo.save(newMoment);
    expect(await repo.hasPublished('2026-10-13', 'u1')).toBe(true);

    const moments = await new Promise<Moment[]>((resolve, reject) => repo.observeDay('2026-10-13', 0, resolve, reject));
    expect(moments.map((m) => m.id)).toEqual(['2026-10-13_u1', 'demo-1']);
  });

  it('guarda las reacciones', async () => {
    const repo = new LocalMomentRepository(new InMemoryStore(), seed);
    await repo.toggleLike(seed(0)[0], 'u1');
    const moments = await new Promise<Moment[]>((resolve, reject) => repo.observeDay('2026-10-13', 0, resolve, reject));
    expect(moments[0].likes).toEqual(['u1']);
  });
});

describe('modo demostración: autenticación local', () => {
  const credentials = { email: 'ana@alumnos.utsv.edu.mx', password: '12345678' };

  it('registra, cierra sesión y vuelve a entrar', async () => {
    const auth = new LocalAuthGateway(new InMemoryStore());
    const seen: (Student | null)[] = [];
    auth.observe((s) => seen.push(s));

    const student = await auth.signUp({ ...credentials, name: 'Ana Ruiz', group: '10-A' });
    expect(student).toMatchObject({ email: credentials.email, verified: true });
    await auth.signOut();
    await auth.signIn(credentials);
    expect(seen.at(-1)?.name).toBe('Ana Ruiz');
  });

  it('rechaza un correo que no tiene cuenta en el teléfono', async () => {
    const auth = new LocalAuthGateway(new InMemoryStore());
    await expect(auth.signIn(credentials)).rejects.toThrow('No encontramos una cuenta');
  });
});

describe('modo demostración: tiempo real', () => {
  it('avisa al instante cuando publicas tu momento', async () => {
    const repo = new LocalMomentRepository(new InMemoryStore(), seed);
    const seen: (Moment | null)[] = [];
    const stop = repo.observeOwn('2026-10-13', 'u1', (own) => seen.push(own), () => undefined);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await repo.save(newMoment);
    await new Promise((resolve) => setTimeout(resolve, 0));
    stop();
    expect(seen[0]).toBeNull();
    expect(seen.at(-1)?.id).toBe('2026-10-13_u1');
  });

  it('entrega los mensajes nuevos del chat a quien está suscrito', async () => {
    const chat = new LocalChatRepository();
    const counts: number[] = [];
    const stop = chat.subscribe((messages) => counts.push(messages.length), () => undefined);
    await chat.send({ authorId: 'u1', authorName: 'Ana', text: '  hola   campus ' });
    stop();
    expect(counts.at(-1)).toBe(counts[0] + 1);
  });

  it('sincroniza a quién sigues', async () => {
    const graph = new LocalSocialGraph(new InMemoryStore());
    const seen: string[][] = [];
    const stop = graph.observeFollowing('u1', (ids) => seen.push(ids));
    await graph.setFollowing('u1', 'u2', true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    stop();
    expect(seen.at(-1)).toEqual(['u2']);
  });

  it('muestra eventos de ejemplo y quita los que se borran', async () => {
    const events = new LocalEventRepository();
    let ids: string[] = [];
    const stop = events.observeUpcoming((list) => (ids = list.map((e) => e.id)), () => undefined);
    expect(ids.length).toBeGreaterThan(0);
    await events.remove(ids[0]);
    stop();
    expect(ids).not.toContain('demo-1');
  });
});
