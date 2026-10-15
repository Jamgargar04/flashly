import type { z } from 'zod';

import { DomainError } from './domain-error';

/**
 * Valida con el esquema y lanza un DomainError con el primer mensaje legible.
 * El código ("validation/<campo>") permite traducir el mensaje en la interfaz.
 */
export const parseOrThrow = <T>(schema: z.ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  const field = issue?.path[0] !== undefined ? String(issue.path[0]) : 'form';
  throw new DomainError(issue?.message ?? 'Revisa los datos.', `validation/${field}`);
};
