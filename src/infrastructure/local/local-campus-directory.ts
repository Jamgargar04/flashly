import type { CampusDirectory, Classmate } from '@/domain/ports';

import { DEMO_CLASSMATES } from './demo-content';

/** Directorio de compañeros. En esta versión usa datos de ejemplo. */
export class LocalCampusDirectory implements CampusDirectory {
  async listClassmates(): Promise<Classmate[]> {
    return DEMO_CLASSMATES;
  }
}
