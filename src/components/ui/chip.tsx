import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { brand, radius, space, usePalette } from '@/constants/theme';

import { PressableScale } from './pressable-scale';
import { Txt } from './text';

/** Etiqueta informativa (grupo, "Tarde", estado de un evento). */
export const Chip = ({ label, color, textColor, icon, style }: { label: string; color?: string; textColor?: string; icon?: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const c = usePalette();
  return (
    <View style={[styles.chip, { backgroundColor: color ?? c.fill }, style]}>
      {icon}
      <Txt variant="caption" color={textColor ?? c.secondary} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
};

type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Variante para fondos oscuros (cámara). */
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Opción seleccionable con un toque: reemplaza escribir fechas, lugares o duraciones. */
export const ChoiceChip = ({ label, selected, onPress, icon, disabled, onDark, style }: ChoiceChipProps) => {
  const c = usePalette();
  const idle = onDark ? 'rgba(255,255,255,0.16)' : c.fill;
  const idleText = onDark ? 'rgba(255,255,255,0.85)' : c.label;
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      haptic="selection"
      scaleTo={0.94}
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled: !!disabled }}
      style={[styles.choice, { backgroundColor: selected ? (onDark ? brand.violet : c.tint) : idle, opacity: disabled ? 0.35 : 1 }, style]}>
      {icon}
      <Txt variant="subhead" color={selected ? '#FFFFFF' : idleText} numberOfLines={1}>
        {label}
      </Txt>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 24, borderRadius: radius.pill, alignSelf: 'flex-start' },
  choice: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, height: 36,
    borderRadius: radius.pill, borderCurve: 'continuous',
  },
});
