/** Lugares del campus que se pueden etiquetar en un momento o en un evento. */
export const CAMPUS_PLACES = ['Biblioteca', 'Cafetería', 'Cancha', 'Laboratorios', 'Aulas', 'Auditorio', 'Estacionamiento'] as const;

export type CampusPlace = (typeof CAMPUS_PLACES)[number];

export const isCampusPlace = (value: unknown): value is CampusPlace => CAMPUS_PLACES.includes(value as CampusPlace);

/** Cuántos momentos se publicaron desde cada lugar (para "Lugares con movimiento"). */
export const countByPlace = (items: { location?: string }[]): Record<CampusPlace, number> => {
  const counts = Object.fromEntries(CAMPUS_PLACES.map((place) => [place, 0])) as Record<CampusPlace, number>;
  for (const item of items) if (isCampusPlace(item.location)) counts[item.location] += 1;
  return counts;
};
