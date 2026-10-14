import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { dayId } from '@/domain/flash-window';
import { services } from '@/infrastructure/container';

import { useSession } from './session-store';

export const usePublishedToday = () => {
  const uid = useSession((s) => s.student?.uid ?? '');
  const [published, setPublished] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!uid) return;
      services.moments.hasPublished(dayId(), uid).then(setPublished).catch(() => setPublished(false));
    }, [uid]),
  );
  return published;
};
