import type { Moment } from '@/domain/moment';
import type { Classmate } from '@/domain/classmate';

const avatar = [
  require('@/assets/demo/avatar1.png'), require('@/assets/demo/avatar2.png'), require('@/assets/demo/avatar3.png'),
  require('@/assets/demo/avatar4.png'), require('@/assets/demo/avatar5.png'), require('@/assets/demo/avatar6.png'),
  require('@/assets/demo/avatar7.png'),
];
const back = [
  require('@/assets/demo/back0.png'), require('@/assets/demo/back1.png'), require('@/assets/demo/back2.png'),
  require('@/assets/demo/back3.png'), require('@/assets/demo/back4.png'),
];
const front = [
  require('@/assets/demo/front1.png'), require('@/assets/demo/front2.png'), require('@/assets/demo/front3.png'),
  require('@/assets/demo/front4.png'), require('@/assets/demo/front5.png'),
];

/** Compañeros ficticios para el modo demostración. */
export const DEMO_CLASSMATES: Classmate[] = [
  { id: 'demo-sofia', name: 'Sofía Cruz', group: '10-A · Software', avatar: avatar[0] },
  { id: 'demo-luis', name: 'Luis Pérez', group: '7-B · Mecatrónica', avatar: avatar[1] },
  { id: 'demo-mariana', name: 'Mariana Soto', group: '4-A · Gastronomía', avatar: avatar[2] },
  { id: 'demo-diego', name: 'Diego Hernández', group: '10-B · Redes', avatar: avatar[3] },
  { id: 'demo-carla', name: 'Carla Muñoz', group: '1-C · Software', avatar: avatar[4] },
  { id: 'demo-andres', name: 'Andrés Rivas', group: '7-A · Química', avatar: avatar[5] },
  { id: 'demo-valeria', name: 'Valeria Ortiz', group: '4-B · Turismo', avatar: avatar[6] },
];

const CAPTIONS = ['Entre clases en la biblioteca', 'Torneo en la cancha', '', 'Café antes del examen', 'Saliendo del laboratorio'];

export const demoMoments = (windowStart: number): Moment[] =>
  DEMO_CLASSMATES.slice(0, 5).map((person, i) => ({
    id: `demo-${i}`,
    authorId: person.id,
    authorName: person.name,
    authorGroup: person.group,
    avatar: person.avatar,
    back: back[i],
    front: front[i],
    caption: CAPTIONS[i],
    createdAt: windowStart + (i * 23 + 8) * 1000,
    late: i === 4,
    likes: i % 2 ? ['demo-x', 'demo-y'] : ['demo-z'],
  }));
