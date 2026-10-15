import { useLang } from '@/application/use-lang';
import type { Strings } from '@/constants/strings';
import { DomainError } from '@/domain/domain-error';

/**
 * Mensaje de error en el idioma elegido: usa el código del error (dominio, Firebase o subida)
 * y, si no lo conoce, el mensaje original en español o uno genérico en inglés.
 */
export const localizeError = (error: unknown, t: Strings, lang: 'es' | 'en'): string => {
  const code = (error as { code?: unknown })?.code;
  const known = t.errors as Record<string, string | undefined>;
  if (typeof code === 'string') {
    const exact = known[code] ?? known[code.replace(/^firestore\//, '')];
    if (exact) return exact;
  }
  if (lang === 'es' && error instanceof DomainError && error.message) return error.message;
  return t.errors.generic;
};

/** Atajo para pantallas: `const errorText = useErrorText(); errorText(e)`. */
export const useErrorText = () => {
  const { t, lang } = useLang();
  return (error: unknown) => localizeError(error, t, lang);
};
