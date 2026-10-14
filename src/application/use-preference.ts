import { useCallback, useEffect, useRef, useState } from 'react';

import { services } from '@/infrastructure/container';

/** Preferencia persistente en el teléfono, con la misma forma que useState. */
export const usePreference = <T,>(key: string, fallback: T) => {
  const initial = useRef(fallback);
  const [value, setValue] = useState<T>(fallback);

  const reload = useCallback(() => {
    services.store.get<T>(key, initial.current).then(setValue).catch(() => undefined);
  }, [key]);

  useEffect(reload, [reload]);

  const update = useCallback(
    async (next: T) => {
      setValue(next);
      await services.store.set(key, next);
    },
    [key],
  );

  return [value, update, reload] as const;
};
