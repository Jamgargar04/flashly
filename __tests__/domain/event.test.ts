import { DomainError } from '@/domain/domain-error';
import { buildEvent, eventStatus, upcomingEvents } from '@/domain/event';
import { defaultStart, isSameDay, moveToDay, timeSlots, upcomingDays } from '@/domain/event-schedule';

const at = (hour: number, minute = 0, dayOffset = 0) => new Date(2026, 9, 15 + dayOffset, hour, minute).getTime();
const HOUR = 60 * 60_000;

describe('eventos del campus', () => {
  const event = { startsAt: at(13), endsAt: at(15) };

  it('sabe si un evento está por empezar, en curso o terminado', () => {
    expect(eventStatus(event, at(10))).toBe('upcoming');
    expect(eventStatus(event, at(12, 30))).toBe('soon');
    expect(eventStatus(event, at(14))).toBe('live');
    expect(eventStatus(event, at(15))).toBe('ended');
  });

  it('oculta solos los eventos que ya terminaron y ordena por fecha', () => {
    const later = { id: 'b', startsAt: at(18), endsAt: at(19) };
    const ended = { id: 'c', startsAt: at(8), endsAt: at(9) };
    const soon = { id: 'a', startsAt: at(11), endsAt: at(12) };
    expect(upcomingEvents([later, ended, soon], at(10)).map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('convierte el borrador en un evento con hora de fin', () => {
    const built = buildEvent({ title: '  Torneo  ', description: '', location: 'Cancha', startsAt: at(13), durationMinutes: 120 }, 'admin-1', at(10));
    expect(built).toEqual({ title: 'Torneo', description: undefined, location: 'Cancha', startsAt: at(13), endsAt: at(15), createdBy: 'admin-1' });
  });

  it('rechaza títulos cortos, fechas pasadas y fechas muy lejanas', () => {
    const draft = { title: 'Torneo', description: '', location: '', startsAt: at(13), durationMinutes: 60 };
    expect(() => buildEvent({ ...draft, title: 'Hi' }, 'a', at(10))).toThrow(DomainError);
    expect(() => buildEvent({ ...draft, startsAt: at(9) }, 'a', at(10))).toThrow('no hayan pasado');
    expect(() => buildEvent({ ...draft, startsAt: at(13, 0, 90) }, 'a', at(10))).toThrow('60 días');
    // Tolerancia: un evento que empieza "ahorita" sí se acepta.
    expect(() => buildEvent({ ...draft, startsAt: at(9, 50) }, 'a', at(10))).not.toThrow();
  });
});

describe('calendario del formulario de eventos', () => {
  it('ofrece hoy y los siguientes días', () => {
    const days = upcomingDays(at(10), 3);
    expect(days).toHaveLength(3);
    expect(isSameDay(days[0], at(0))).toBe(true);
    expect(isSameDay(days[2], at(0, 0, 2))).toBe(true);
  });

  it('solo muestra horarios que no han pasado, cada 30 minutos', () => {
    const slots = timeSlots(at(0), at(20, 10));
    expect(slots).toEqual([at(20, 30), at(21), at(21, 30)]);
    expect(timeSlots(at(0, 0, 1), at(20, 10))).toHaveLength(30);
  });

  it('propone el siguiente horario libre, o mañana si ya es tarde', () => {
    expect(defaultStart(at(10, 5))).toBe(at(10, 30));
    expect(defaultStart(at(23))).toBe(at(7, 0, 1));
  });

  it('al cambiar de día conserva la hora elegida', () => {
    expect(moveToDay(at(13), at(0, 0, 2), at(10))).toBe(at(13, 0, 2));
    // Si en el nuevo día esa hora ya pasó, toma el siguiente horario libre.
    expect(moveToDay(at(9, 0, 1), at(0), at(10, 5))).toBe(at(10, 30));
    expect(at(13) - at(12)).toBe(HOUR);
  });
});
