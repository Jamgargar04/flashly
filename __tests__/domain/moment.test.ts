import { assertCanPublish, CAPTION_MAX, isLate, momentId, sanitizeCaption, toggleLike, type Moment } from '@/domain/moment';

const moment: Moment = {
  id: 'm1', authorId: 'u1', authorName: 'Ana', back: { uri: 'b' }, front: { uri: 'f' },
  caption: '', createdAt: 0, late: false, likes: ['u2'],
};

describe('reglas del momento', () => {
  it('usa un id por estudiante y por día', () => {
    expect(momentId('2026-10-13', 'u1')).toBe('2026-10-13_u1');
  });

  it('limpia espacios y limita el comentario', () => {
    expect(sanitizeCaption('  hola    mundo  ')).toBe('hola mundo');
    expect(sanitizeCaption('x'.repeat(200))).toHaveLength(CAPTION_MAX);
  });

  it('no deja publicar antes de que abra la ventana', () => {
    expect(() => assertCanPublish('waiting', false)).toThrow('todavía no se abre');
  });

  it('no deja publicar dos veces el mismo día', () => {
    expect(() => assertCanPublish('open', true)).toThrow('Ya publicaste');
  });

  it('permite publicar a tiempo y tarde', () => {
    expect(() => assertCanPublish('open', false)).not.toThrow();
    expect(() => assertCanPublish('closed', false)).not.toThrow();
    expect(isLate('open')).toBe(false);
    expect(isLate('closed')).toBe(true);
  });

  it('agrega y quita reacciones sin modificar el original', () => {
    const liked = toggleLike(moment, 'u1');
    expect(liked.likes).toEqual(['u2', 'u1']);
    expect(toggleLike(liked, 'u1').likes).toEqual(['u2']);
    expect(moment.likes).toEqual(['u2']);
  });
});
