import { BookOpen, Car, Coffee, FlaskConical, Presentation, School, Trophy, type LucideIcon } from 'lucide-react-native';

import type { CampusPlace } from '@/domain/place';
import { system } from '@/constants/theme';

/** Ícono y color de cada lugar del campus (consistentes en Descubrir, la cámara y los eventos). */
export const PLACE_VISUALS: Record<CampusPlace, { Icon: LucideIcon; color: string }> = {
  Biblioteca: { Icon: BookOpen, color: system.indigo },
  Cafetería: { Icon: Coffee, color: system.orange },
  Cancha: { Icon: Trophy, color: system.teal },
  Laboratorios: { Icon: FlaskConical, color: system.green },
  Aulas: { Icon: School, color: system.blue },
  Auditorio: { Icon: Presentation, color: system.purple },
  Estacionamiento: { Icon: Car, color: system.gray },
};
