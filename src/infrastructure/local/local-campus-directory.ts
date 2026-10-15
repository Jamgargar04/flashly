import type { Classmate } from '@/domain/classmate';
import type { CampusDirectory, ErrorListener, Unsubscribe } from '@/domain/ports';

import { DEMO_CLASSMATES } from './demo-content';

/** Directorio de compañeros del modo demostración (datos de ejemplo). */
export class LocalCampusDirectory implements CampusDirectory {
  observe(onChange: (people: Classmate[]) => void, _onError: ErrorListener): Unsubscribe {
    onChange(DEMO_CLASSMATES);
    return () => undefined;
  }
}
