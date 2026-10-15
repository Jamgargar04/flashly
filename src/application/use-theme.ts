import { useCallback, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';

import { PREFERENCES } from './preference-keys';
import { usePreference } from './use-preference';

type ThemeChoice = 'light' | 'dark' | null;

/**
 * Persiste y aplica la elección de tema del usuario (claro / oscuro / sistema).
 * Llámalo en el layout raíz para inicializar el tema guardado al arrancar la app.
 */
export const useTheme = () => {
  const scheme = useColorScheme();
  const [saved, setSaved] = usePreference<ThemeChoice>(PREFERENCES.theme, null);

  useEffect(() => {
    if (saved !== null) Appearance.setColorScheme(saved);
  }, [saved]);

  const toggle = useCallback(async () => {
    const next: 'light' | 'dark' = scheme === 'dark' ? 'light' : 'dark';
    Appearance.setColorScheme(next);
    await setSaved(next);
  }, [scheme, setSaved]);

  return { isDark: scheme === 'dark', toggle };
};
