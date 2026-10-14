import { APP_VERSION } from '@/infrastructure/env';
import { services } from '@/infrastructure/container';

const PROVIDERS = { cloudinary: 'Cloudinary', firebase: 'Firebase Storage', local: 'el teléfono' } as const;

export const appInfo = {
  version: APP_VERSION,
  mode: services.mode,
  summary:
    services.mode === 'cloud'
      ? `Conectado a Firebase · fotos en ${PROVIDERS[services.photoProvider]}`
      : 'Modo demostración · datos solo en este teléfono',
};
