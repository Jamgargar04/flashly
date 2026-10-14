import { useMemo } from 'react';

import { services } from '@/infrastructure/container';

import { createPublishMoment } from './publish-moment';

/** Conecta el caso de uso con los servicios reales de la raíz de composición. */
export const usePublishMoment = () => useMemo(() => createPublishMoment(services), []);
