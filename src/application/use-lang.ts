import { STRINGS } from '@/constants/strings';

import { usePreferences } from './preferences-store';

/** Textos en el idioma elegido. Cambiar el idioma actualiza todas las pantallas a la vez. */
export const useLang = () => {
  const lang = usePreferences((s) => s.lang);
  return { lang, t: STRINGS[lang] };
};

/** Textos fuera de componentes (avisos, notificaciones). */
export const currentStrings = () => STRINGS[usePreferences.getState().lang];
