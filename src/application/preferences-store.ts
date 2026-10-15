import { Appearance } from 'react-native';
import { create } from 'zustand';

import type { Lang } from '@/constants/strings';
import { services } from '@/infrastructure/container';

import { PREFERENCES } from './preference-keys';

export type ThemeChoice = 'system' | 'light' | 'dark';

type PreferencesState = {
  hydrated: boolean;
  theme: ThemeChoice;
  lang: Lang;
  largeText: boolean;
};

type PreferencesActions = {
  hydrate: () => Promise<void>;
  setTheme: (theme: ThemeChoice) => void;
  setLang: (lang: Lang) => void;
  setLargeText: (largeText: boolean) => void;
};

/** En Android e iOS cambia el tema de toda la app (incluidos controles nativos). En web no existe: se ignora. */
const applyTheme = (theme: ThemeChoice) => {
  try {
    Appearance.setColorScheme?.(theme === 'system' ? 'unspecified' : theme);
  } catch {
    // Plataforma sin soporte: se queda el tema del sistema.
  }
};

/**
 * Preferencias de visualización (tema, idioma, texto grande) en un solo estado global:
 * al cambiar una, todas las pantallas se actualizan al instante y se guarda en el teléfono.
 */
export const usePreferences = create<PreferencesState & PreferencesActions>()((set) => ({
  hydrated: false,
  theme: 'system',
  lang: 'es',
  largeText: false,

  hydrate: async () => {
    const [savedTheme, lang, largeText] = await Promise.all([
      services.store.get<ThemeChoice | null>(PREFERENCES.theme, null),
      services.store.get<Lang>(PREFERENCES.lang, 'es'),
      services.store.get<boolean>(PREFERENCES.largeFonts, false),
    ]);
    // Versiones anteriores guardaban null para "sistema".
    const theme: ThemeChoice = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'system';
    applyTheme(theme);
    set({ theme, lang: lang === 'en' ? 'en' : 'es', largeText: largeText === true, hydrated: true });
  },

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
    void services.store.set(PREFERENCES.theme, theme);
  },

  setLang: (lang) => {
    set({ lang });
    void services.store.set(PREFERENCES.lang, lang);
  },

  setLargeText: (largeText) => {
    set({ largeText });
    void services.store.set(PREFERENCES.largeFonts, largeText);
  },
}));
