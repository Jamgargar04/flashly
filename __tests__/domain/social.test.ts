import { buildChatRows, countUnread, sanitizeMessage, type ChatMessage } from '@/domain/chat-message';
import { matchesQuery, rankClassmates } from '@/domain/classmate';
import { filterFeed, timeToExpire, MOMENT_TTL_MS, type Moment } from '@/domain/moment';
import { countByPlace, isCampusPlace } from '@/domain/place';

const at = (hour: number, minute = 0, dayOffset = 0) => new Date(2026, 9, 15 + dayOffset, hour, minute).getTime();
const msg = (id: string, authorId: string, createdAt: number): ChatMessage => ({ id, authorId, authorName: authorId, text: id, createdAt });

describe('chat del campus', () => {
  it('limpia espacios y saltos de línea de más', () => {
    expect(sanitizeMessage('  hola    a   todos  ')).toBe('hola a todos');
    expect(sanitizeMessage('uno\n\n\n\ndos')).toBe('uno\n\ndos');
    expect(sanitizeMessage('x'.repeat(300))).toHaveLength(200);
  });

  it('agrupa mensajes seguidos y separa los días (lista invertida)', () => {
    // Más nuevo primero.
    const messages = [msg('m4', 'ana', at(10, 6)), msg('m3', 'ana', at(10, 5)), msg('m2', 'luis', at(10, 1)), msg('m1', 'luis', at(18, 0, -1))];
    const rows = buildChatRows(messages, 'ana');
    const kinds = rows.map((row) => (row.kind === 'day' ? 'day' : row.key));
    expect(kinds).toEqual(['m4', 'm3', 'm2', 'day', 'm1', 'day']);

    const byKey = Object.fromEntries(rows.filter((r) => r.kind === 'message').map((r) => [r.key, r]));
    expect(byKey.m4).toMatchObject({ mine: true, first: false, last: true });
    expect(byKey.m3).toMatchObject({ mine: true, first: true, last: false });
    // Mismo autor pero en otro día: grupos separados.
    expect(byKey.m2).toMatchObject({ first: true, last: true });
    expect(byKey.m1).toMatchObject({ first: true, last: true });
  });

  it('cuenta como no leídos solo los mensajes nuevos de otras personas', () => {
    const messages = [msg('a', 'luis', at(11)), msg('b', 'ana', at(11, 30)), msg('c', 'luis', at(9))];
    expect(countUnread(messages, 'ana', at(10))).toBe(1);
  });
});

describe('lugares y personas', () => {
  it('cuenta momentos por lugar e ignora lugares desconocidos', () => {
    const counts = countByPlace([{ location: 'Cancha' }, { location: 'Cancha' }, { location: 'Marte' }, {}]);
    expect(counts.Cancha).toBe(2);
    expect(counts.Biblioteca).toBe(0);
    expect(isCampusPlace('Marte')).toBe(false);
  });

  it('sugiere primero a tu grupo y a quien aún no sigues, sin incluirte', () => {
    const people = [
      { id: 'me', name: 'Yo', group: '10-A' },
      { id: 'b', name: 'Beto', group: '7-B' },
      { id: 'c', name: 'Carla', group: '10-A' },
      { id: 'd', name: 'Diana', group: '10-A' },
      { id: 'e', name: '', group: '10-A' },
    ];
    const ranked = rankClassmates(people, { uid: 'me', group: '10-a' }, ['d']);
    expect(ranked.map((p) => p.id)).toEqual(['c', 'd', 'b']);
  });

  it('busca sin importar acentos ni mayúsculas', () => {
    expect(matchesQuery({ name: 'Sofía Cruz', group: '10-A · Software' }, 'sofia')).toBe(true);
    expect(matchesQuery({ name: 'Sofía Cruz', group: '10-A · Software' }, 'SOFTWARE')).toBe(true);
    expect(matchesQuery({ name: 'Sofía Cruz', group: '10-A' }, 'luis')).toBe(false);
  });
});

describe('feed del día', () => {
  const moment = (id: string, authorId: string): Moment => ({
    id, authorId, authorName: authorId, back: 1, front: 2, caption: '', createdAt: at(10), late: false, likes: [],
  });

  it('filtra por las personas que sigues sin ocultar tu momento', () => {
    const moments = [moment('1', 'me'), moment('2', 'ana'), moment('3', 'luis')];
    expect(filterFeed(moments, 'all', [], 'me')).toHaveLength(3);
    expect(filterFeed(moments, 'following', ['luis'], 'me').map((m) => m.id)).toEqual(['1', '3']);
  });

  it('calcula cuánto le queda a un momento antes de borrarse', () => {
    expect(timeToExpire({ createdAt: at(10) }, at(10))).toBe(MOMENT_TTL_MS);
    expect(timeToExpire({ createdAt: at(10) }, at(11, 0, 1))).toBe(0);
  });
});
