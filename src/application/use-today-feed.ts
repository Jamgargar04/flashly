import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { toggleLike, type Moment } from '@/domain/moment';
import { services } from '@/infrastructure/container';

import { useSession } from './session-store';

/**
 * Lógica del feed del día separada de la pantalla:
 * sabe si ya publicaste, se suscribe en tiempo real y aplica reacciones optimistas.
 */
export const useTodayFeed = (day: string, windowStart: number) => {
  const uid = useSession((s) => s.student?.uid ?? '');
  const [published, setPublished] = useState(false);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => {
    if (!uid) return;
    services.moments.hasPublished(day, uid).then(setPublished).catch(() => setPublished(false));
    setRevision((r) => r + 1);
  }, [uid, day]);

  useFocusEffect(refresh);

  useEffect(() => {
    if (!published) return;
    return services.moments.observeDay(day, windowStart, setMoments, () => setMoments([]));
  }, [published, day, windowStart, revision]);

  const like = useCallback(
    (moment: Moment) => {
      setMoments((list) => list.map((m) => (m.id === moment.id ? toggleLike(m, uid) : m)));
      services.moments.toggleLike(moment, uid).catch(() => refresh());
    },
    [uid, refresh],
  );

  return { uid, published, moments, refresh, like };
};
