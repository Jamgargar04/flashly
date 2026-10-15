import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { useNow } from '@/application/use-now';
import { motion, radius, space } from '@/constants/theme';
import type { Moment } from '@/domain/moment';

import { MomentCard } from './moment-card';
import { Skeleton } from './ui';
import { useMomentActions } from './use-moment-actions';

/** Lista de momentos: entran en cascada y los nuevos aparecen en vivo, reacomodando la lista con un resorte. */
export const MomentList = ({ moments }: { moments: Moment[] }) => {
  const { uid, like, more, openAuthor } = useMomentActions();
  const now = useNow(60_000);
  return (
    <View style={{ gap: space.lg }}>
      {moments.map((moment, i) => (
        <Animated.View
          key={moment.id}
          entering={FadeInDown.delay(Math.min(i, 5) * motion.stagger).springify().damping(18)}
          layout={LinearTransition.springify().damping(20)}>
          <MomentCard moment={moment} uid={uid} now={now} onLike={like} onMore={more} onAuthorPress={openAuthor} />
        </Animated.View>
      ))}
    </View>
  );
};

/** Marcadores de carga con la forma de una publicación. */
export const MomentSkeletons = () => (
  <View style={{ gap: space.lg }}>
    {[0, 1].map((i) => (
      <View key={i} style={{ gap: space.md }}>
        <Skeleton width="55%" height={18} />
        <Skeleton rounded={radius.lg} style={{ aspectRatio: 4 / 5 }} />
      </View>
    ))}
  </View>
);
