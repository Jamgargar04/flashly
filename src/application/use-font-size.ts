import { useCallback, useEffect } from 'react';

import { useFontSizeStore } from './font-size-store';
import { PREFERENCES } from './preference-keys';
import { usePreference } from './use-preference';

export const useFontSize = () => {
  const [saved, setSaved] = usePreference<boolean>(PREFERENCES.largeFonts, false);
  const { isLarge, setIsLarge } = useFontSizeStore();

  // Sync store with persisted preference on mount.
  useEffect(() => {
    setIsLarge(saved);
  }, [saved, setIsLarge]);

  const toggle = useCallback(async () => {
    const next = !isLarge;
    setIsLarge(next);
    await setSaved(next);
  }, [isLarge, setIsLarge, setSaved]);

  return { isLarge, toggle };
};
