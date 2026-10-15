import type { PhotoSource } from './moment';

/** Otra persona registrada en Flashly, como aparece en Descubrir. */
export type Classmate = {
  id: string;
  name: string;
  group: string;
  bio?: string;
  photoUrl?: string;
  /** Foto empaquetada de los compañeros de ejemplo del modo demostración. */
  avatar?: PhotoSource;
};

const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Busca por nombre o grupo, sin importar acentos ni mayúsculas. */
export const matchesQuery = (person: Pick<Classmate, 'name' | 'group'>, query: string): boolean => {
  const q = normalize(query);
  if (!q) return true;
  return normalize(person.name).includes(q) || normalize(person.group).includes(q);
};

/**
 * Sugerencias automáticas: primero tu grupo, luego a quien aún no sigues, y por nombre.
 * Te excluye a ti y a las cuentas sin nombre.
 */
export const rankClassmates = <T extends Classmate>(people: T[], me: { uid: string; group: string }, following: string[]): T[] => {
  const myGroup = normalize(me.group);
  const score = (person: T): number =>
    (myGroup && normalize(person.group) === myGroup ? 0 : 2) + (following.includes(person.id) ? 1 : 0);
  return people
    .filter((person) => person.id !== me.uid && person.name.trim().length > 0)
    .sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name));
};
