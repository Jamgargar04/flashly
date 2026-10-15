import { upcomingEvents, type CampusEvent, type NewCampusEvent } from '@/domain/event';
import type { ErrorListener, EventRepository, Unsubscribe } from '@/domain/ports';

import { LocalChangeNotifier } from './local-change-notifier';

const HOUR = 60 * 60_000;

/** Eventos de ejemplo relativos a la hora actual, para que el modo demostración siempre tenga algo. */
const demoEvents = (now: number): CampusEvent[] => {
  const at = (days: number, hour: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    date.setHours(hour, 0, 0, 0);
    return date.getTime();
  };
  return [
    { id: 'demo-1', title: 'Torneo relámpago de fútbol', description: 'Arma tu equipo de 5 y ven a la cancha.', location: 'Cancha', startsAt: at(1, 13), endsAt: at(1, 13) + 2 * HOUR, createdBy: 'demo' },
    { id: 'demo-2', title: 'Taller de fotografía con celular', description: 'Aprende a sacar mejores fotos para tu momento del día.', location: 'Aulas', startsAt: at(2, 11), endsAt: at(2, 11) + HOUR, createdBy: 'demo' },
    { id: 'demo-3', title: 'Noche de cine en el auditorio', location: 'Auditorio', startsAt: at(3, 18), endsAt: at(3, 18) + 3 * HOUR, createdBy: 'demo' },
  ];
};

/** Eventos en memoria para el modo demostración, con avisos de cambio como Firestore. */
export class LocalEventRepository implements EventRepository {
  private events: CampusEvent[] = demoEvents(Date.now());
  private readonly changes = new LocalChangeNotifier();

  observeUpcoming(onChange: (events: CampusEvent[]) => void, _onError: ErrorListener): Unsubscribe {
    const emit = () => onChange(upcomingEvents(this.events, Date.now()));
    emit();
    return this.changes.subscribe(emit);
  }

  async create(event: NewCampusEvent): Promise<void> {
    this.events = [...this.events, { ...event, id: `local-${Date.now()}` }];
    this.changes.notify();
  }

  async remove(eventId: string): Promise<void> {
    this.events = this.events.filter((event) => event.id !== eventId);
    this.changes.notify();
  }
}
