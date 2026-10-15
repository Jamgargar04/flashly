import type { CampusEvent } from '@/domain/event';
import type { EventRepository } from '@/domain/ports';

const DEMO_EVENTS: CampusEvent[] = [
  { id: '1', title: 'Torneo relámpago de fútbol', when: 'Jueves, 13:00', location: 'Cancha' },
  { id: '2', title: 'Taller de fotografía con celular', when: 'Viernes, 11:00', location: 'Aulas' },
  { id: '3', title: 'Noche de cine en el auditorio', when: 'Viernes, 18:30', location: 'Auditorio' },
];

export class LocalEventRepository implements EventRepository {
  async listUpcoming(): Promise<CampusEvent[]> {
    return DEMO_EVENTS;
  }
}
