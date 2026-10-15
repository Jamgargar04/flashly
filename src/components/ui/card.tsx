import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { elevation, radius, space, usePalette } from '@/constants/theme';

type CardProps = { children: React.ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean };

/** Superficie elevada con esquinas continuas (squircle) y sombra suave en modo claro. */
export const Card = ({ children, style, padded = true }: CardProps) => {
  const c = usePalette();
  return (
    <View style={[styles.card, { backgroundColor: c.card }, c.scheme === 'light' && elevation.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderCurve: 'continuous' },
  padded: { padding: space.lg },
});
