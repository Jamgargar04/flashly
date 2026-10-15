import { z } from 'zod';

import { DomainError } from './domain-error';

export const INSTITUTION_DOMAIN = 'alumnos.utsv.edu.mx';
export const TEACHER_DOMAIN = 'utsv.edu.mx';

export type Student = {
  uid: string;
  email: string;
  name: string;
  group: string;
  bio?: string;
  isAdmin?: boolean;
  verified: boolean;
};

const institutionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email('Escribe un correo válido.')
  .refine(
    (email) => email.endsWith('@' + INSTITUTION_DOMAIN) || email.endsWith('@' + TEACHER_DOMAIN),
    `Usa tu correo institucional @${INSTITUTION_DOMAIN} o @${TEACHER_DOMAIN}.`,
  );

const password = z.string().min(8, 'La contraseña necesita al menos 8 caracteres.');

export const signInSchema = z.object({ email: institutionalEmail, password });

export const signUpSchema = signInSchema.extend({
  name: z.string().trim().min(3, 'Escribe tu nombre completo.').max(60, 'El nombre es demasiado largo.'),
  group: z.string().trim().max(40, 'El grupo es demasiado largo.'),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

/** Valida con el esquema y lanza un DomainError con el primer mensaje legible. */
export const parseOrThrow = <T>(schema: z.ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  throw new DomainError(result.error.issues[0]?.message ?? 'Revisa los datos.', 'validation');
};

export const isInstitutionalEmail = (email: string): boolean => institutionalEmail.safeParse(email).success;

export const isTeacherEmail = (email: string): boolean =>
  email.trim().toLowerCase().endsWith('@' + TEACHER_DOMAIN) &&
  !email.trim().toLowerCase().endsWith('@' + INSTITUTION_DOMAIN);
