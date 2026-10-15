import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { brand, gradient, radius, space, usePalette } from '@/constants/theme';

import { PressableScale } from './pressable-scale';
import { Txt } from './text';

export type ButtonVariant = 'primary' | 'flash' | 'secondary' | 'tinted' | 'plain' | 'destructive';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  /** Texto mientras carga (por ejemplo, "Subiendo…"). */
  loadingLabel?: string;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Button = ({ title, onPress, variant = 'primary', icon, loading, loadingLabel, disabled, compact, style }: ButtonProps) => {
  const c = usePalette();
  const color = {
    primary: c.onTint,
    flash: brand.flashInk,
    secondary: c.tint,
    tinted: c.tint,
    plain: c.tint,
    destructive: c.danger,
  }[variant];
  const background = {
    primary: 'transparent',
    flash: brand.flash,
    secondary: c.fill,
    tinted: c.tintFill,
    plain: 'transparent',
    destructive: c.fill,
  }[variant];
  const height = compact ? 44 : 54;
  const inactive = disabled || loading;

  const content = (
    <View style={styles.row}>
      {loading ? <ActivityIndicator color={color} /> : icon}
      {!loading || loadingLabel ? (
        <Txt variant="headline" color={color} numberOfLines={1}>
          {loading ? loadingLabel : title}
        </Txt>
      ) : null}
    </View>
  );

  return (
    <PressableScale
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      haptic={variant === 'plain' ? false : 'light'}
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[{ opacity: disabled ? 0.4 : 1 }, style]}>
      {variant === 'primary' ? (
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, { height }]}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.button, { height, backgroundColor: background }]}>{content}</View>
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  button: { borderRadius: radius.md, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
