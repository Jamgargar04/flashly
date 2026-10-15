import React, { useEffect } from 'react';
import { type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { radius, usePalette } from '@/constants/theme';

type SkeletonProps = { width?: DimensionValue; height?: DimensionValue; rounded?: number; style?: StyleProp<ViewStyle> };

/** Marcador de carga que "respira" mientras llegan los datos. */
export const Skeleton = ({ width = '100%', height, rounded = radius.md, style }: SkeletonProps) => {
  const c = usePalette();
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 850, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return <Animated.View style={[{ width, height, borderRadius: rounded, backgroundColor: c.fill }, animatedStyle, style]} />;
};
