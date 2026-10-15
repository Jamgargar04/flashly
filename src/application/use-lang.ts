import { PREFERENCES } from './preference-keys';
import { usePreference } from './use-preference';
import { STRINGS, type Lang } from '@/constants/strings';

export const useLang = () => {
  const [lang, setLang] = usePreference<Lang>(PREFERENCES.lang, 'es');
  const t = STRINGS[lang];
  const toggleLang = () => setLang(lang === 'es' ? 'en' : 'es');
  return { t, lang, toggleLang };
};
