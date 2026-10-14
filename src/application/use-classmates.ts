import { useEffect, useState } from 'react';

import type { Classmate } from '@/domain/ports';
import { services } from '@/infrastructure/container';

export const useClassmates = () => {
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  useEffect(() => {
    services.directory.listClassmates().then(setClassmates).catch(() => setClassmates([]));
  }, []);
  return classmates;
};
