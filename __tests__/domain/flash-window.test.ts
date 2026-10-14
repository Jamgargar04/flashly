import {
  computeWindow, dayId, phaseOf, secondsLeft, surpriseMinute, WINDOW_MINUTES, WINDOW_RANGE,
} from '@/domain/flash-window';

const days = (count: number) =>
  Array.from({ length: count }, (_, i) => dayId(new Date(2026, 9, 1 + i)));

describe('ventana del flash', () => {
  it('es la misma para todos los teléfonos durante el mismo día', () => {
    expect(computeWindow(new Date(2026, 9, 13, 8, 0))).toEqual(computeWindow(new Date(2026, 9, 13, 22, 30)));
  });

  it('cae siempre entre las 9:00 y las 20:00', () => {
    for (const id of days(90)) {
      const minute = surpriseMinute(id);
      expect(minute).toBeGreaterThanOrEqual(WINDOW_RANGE.fromHour * 60);
      expect(minute).toBeLessThan(WINDOW_RANGE.toHour * 60);
    }
  });

  it('cambia de hora de un día a otro', () => {
    const minutes = new Set(days(30).map(surpriseMinute));
    expect(minutes.size).toBeGreaterThan(25);
  });

  it('dura exactamente 2 minutos', () => {
    const w = computeWindow(new Date(2026, 9, 13));
    expect(w.end - w.start).toBe(WINDOW_MINUTES * 60_000);
  });

  it('usa el modo prueba solo si es del mismo día', () => {
    const today = new Date(2026, 9, 13, 10, 0);
    const override = new Date(2026, 9, 13, 10, 5).getTime();
    const yesterday = new Date(2026, 9, 12, 10, 5).getTime();
    expect(computeWindow(today, override).start).toBe(override);
    expect(computeWindow(today, yesterday).start).not.toBe(yesterday);
  });

  it('calcula la fase en los límites exactos', () => {
    const w = { id: 'x', start: 1000, end: 2000 };
    expect(phaseOf(w, 999)).toBe('waiting');
    expect(phaseOf(w, 1000)).toBe('open');
    expect(phaseOf(w, 1999)).toBe('open');
    expect(phaseOf(w, 2000)).toBe('closed');
  });

  it('nunca devuelve segundos negativos', () => {
    expect(secondsLeft({ id: 'x', start: 0, end: 120_000 }, 60_500)).toBe(60);
    expect(secondsLeft({ id: 'x', start: 0, end: 120_000 }, 500_000)).toBe(0);
  });

  it('formatea el día con ceros a la izquierda', () => {
    expect(dayId(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
