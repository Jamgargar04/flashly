import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, type AccessibilityRole, type AccessibilityState, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { motion } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | false;

export const playHaptic = (style: HapticStyle) => {
  if (!style) return;
  const run =
    style === 'selection'
      ? Haptics.selectionAsync()
      : Haptics.impactAsync(
          style === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
        );
  run.catch(() => undefined);
};

export type PressableScaleProps = {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  /** Qué tanto se encoge al presionar (1 = nada). */
  scaleTo?: number;
  haptic?: HapticStyle;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  children: React.ReactNode;
};

/** Botón base con respuesta física: se encoge con un resorte al tocarlo, como en iOS. */
export const PressableScale = ({
  onPress, onLongPress, disabled, scaleTo = 0.97, haptic = false, hitSlop, style, children,
  accessibilityRole = 'button', ...a11y
}: PressableScaleProps) => {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, scaleTo]) }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        pressed.value = withSpring(1, motion.spring.snappy);
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, motion.spring.snappy);
      }}
      onPress={() => {
        playHaptic(haptic);
        onPress?.();
      }}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole={accessibilityRole}
      style={[style, animatedStyle]}
      {...a11y}>
      {children}
    </AnimatedPressable>
  );
};
