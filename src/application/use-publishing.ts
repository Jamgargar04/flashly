import { useMemo } from 'react';

import { services } from '@/infrastructure/container';

import { createChangeAvatar } from './change-avatar';
import { createPublishEvent } from './publish-event';
import { createPublishMoment } from './publish-moment';
import { useSession } from './session-store';

/** Conectan los casos de uso con los servicios reales de la raíz de composición. */
export const usePublishMoment = () => useMemo(() => createPublishMoment(services), []);

export const usePublishEvent = () => useMemo(() => createPublishEvent(services), []);

export const useChangeAvatar = () => {
  const updateProfile = useSession((s) => s.updateProfile);
  return useMemo(() => createChangeAvatar({ ...services, updateProfile }), [updateProfile]);
};
