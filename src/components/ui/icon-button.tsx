import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { usePalette } from '@/constants/theme';

import { Badge } from './badge';
import { PressableScale } from './pressable-scale';

type IconButtonProps = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  /** fill: gris del sistema · glass: sobre fotos · tint: color de marca suave · plain: sin fondo. */
  variant?: 'fill' | 'glass' | 'tint' | 'plain';
  size?: number;
  badge?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const IconButton = ({ icon, label, onPress, variant = 'fill', size = 40, badge, disabled, style }: IconButtonProps) => {
  const c = usePalette();
  const background = { fill: c.fill, glass: 'rgba(0,0,0,0.38)', tint: c.tintFill, plain: 'transparent' }[variant];
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.9}
      haptic="light"
      hitSlop={8}
      accessibilityLabel={label}
      style={[{ opacity: disabled ? 0.4 : 1 }, style]}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: background }]}>{icon}</View>
      {badge ? <Badge count={badge} style={styles.badge} /> : null}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -4, right: -6 },
});
