import { services } from '@/infrastructure/container';
import { APP_VERSION } from '@/infrastructure/env';

export const appInfo = {
  version: APP_VERSION,
  mode: services.mode,
};
