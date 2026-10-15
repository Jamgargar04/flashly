import { z } from 'zod';

export { parseOrThrow } from './validation';

export const INSTITUTION_DOMAIN = 'alumnos.utsv.edu.mx';
export const TEACHER_DOMAIN = 'utsv.edu.mx';
export const PROFILE_LIMITS = { name: 60, group: 40, bio: 120 } as const;

export type Student = {
  uid: string;
  email: string;
  name: string;
  group: string;
  bio?: string;
  photoUrl?: string;
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
  name: z.string().trim().min(3, 'Escribe tu nombre completo.').max(PROFILE_LIMITS.name, 'El nombre es demasiado largo.'),
  group: z.string().trim().max(PROFILE_LIMITS.group, 'El grupo es demasiado largo.'),
});

export const emailSchema = z.object({ email: institutionalEmail });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

export const isInstitutionalEmail = (email: string): boolean => institutionalEmail.safeParse(email).success;

export const isTeacherEmail = (email: string): boolean => {
  const value = email.trim().toLowerCase();
  return value.endsWith('@' + TEACHER_DOMAIN) && !value.endsWith('@' + INSTITUTION_DOMAIN);
};

/**
 * Autocompleta el dominio institucional: con escribir la matrícula basta.
 * "dsm123" → ["dsm123@alumnos.utsv.edu.mx", "dsm123@utsv.edu.mx"].
 */
export const completeEmail = (input: string): string[] => {
  const value = input.trim().toLowerCase();
  if (!value || /\s/.test(value)) return [];
  const [user, typedDomain = ''] = value.split('@');
  if (!user) return [];
  return [INSTITUTION_DOMAIN, TEACHER_DOMAIN]
    .filter((domain) => domain.startsWith(typedDomain) && domain !== typedDomain)
    .map((domain) => `${user}@${domain}`);
};

export const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? '';
