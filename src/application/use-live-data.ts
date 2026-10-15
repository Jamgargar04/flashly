import { useEffect } from 'react';

import { useChat } from './chat-store';
import { useDirectory } from './directory-store';
import { useEventReminders } from './event-reminders-store';
import { useEvents } from './events-store';
import { useFeed } from './feed-store';
import { useReminders } from './use-reminders';
import { useFlashWindow } from './use-flash-window';

/**
 * Abre una sola vez las suscripciones en tiempo real de la sesión (feed, chat, eventos, personas)
 * y las automatizaciones (aviso diario, recordatorios). Las pantallas solo leen los estados.
 */
export const useLiveData = (uid: string) => {
  const { window } = useFlashWindow(30_000);

  useEffect(() => useChat.getState().start(uid), [uid]);
  useEffect(() => useDirectory.getState().start(uid), [uid]);
  useEffect(() => useEvents.getState().start(), []);
  useEffect(() => useFeed.getState().start(uid, window.id, window.start), [uid, window.id, window.start]);

  useEffect(() => {
    useReminders.getState().autoSetup().catch(() => undefined);
    useEventReminders.getState().hydrate().catch(() => undefined);
  }, [uid]);
};
