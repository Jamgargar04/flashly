import { useEffect, useState } from 'react';

import type { CampusEvent } from '@/domain/event';
import { services } from '@/infrastructure/container';

export const useEvents = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  useEffect(() => {
    services.events.listUpcoming().then(setEvents).catch(() => setEvents([]));
  }, []);
  return events;
};
