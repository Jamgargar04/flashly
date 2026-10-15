import { services } from '@/infrastructure/container';

/** Abre la galería del teléfono con recorte. Devuelve la ruta local o null si se cancela. */
export const pickImage = (options: { aspect: [number, number]; circular?: boolean }) => services.picker.pickImage(options);
