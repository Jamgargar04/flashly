import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { usePreferences } from '@/application/preferences-store';
import { LARGE_TEXT_SCALE, type, usePalette, type TypeVariant } from '@/constants/theme';

/** Estilo tipográfico respetando el ajuste de accesibilidad "Texto grande". */
export const useTypeStyle = (variant: TypeVariant) => {
  const largeText = usePreferences((s) => s.largeText);
  const base = type[variant];
  if (!largeText) return base;
  return { ...base, fontSize: base.fontSize * LARGE_TEXT_SCALE, lineHeight: base.lineHeight * LARGE_TEXT_SCALE };
};

type TxtProps = {
  variant?: TypeVariant;
  color?: string;
  center?: boolean;
  numberOfLines?: number;
  selectable?: boolean;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
};

export const Txt = ({ variant = 'body', color, center, numberOfLines, selectable, style, children }: TxtProps) => {
  const c = usePalette();
  const typeStyle = useTypeStyle(variant);
  return (
    <Text numberOfLines={numberOfLines} selectable={selectable} style={[typeStyle, { color: color ?? c.label }, center && styles.center, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({ center: { textAlign: 'center' } });
