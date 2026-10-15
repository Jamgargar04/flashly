/** Ubicaciones del campus que el usuario puede etiquetar en su momento. */
export const CAMPUS_LOCATIONS = [
  'Biblioteca',
  'Cafetería',
  'Cancha',
  'Laboratorios',
  'Estacionamiento',
  'Aulas',
  'Auditorio',
] as const;

export type CampusLocation = (typeof CAMPUS_LOCATIONS)[number];
