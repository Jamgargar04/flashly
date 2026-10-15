import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';

import { font, usePalette } from '@/constants/theme';

/** Contador rojo de novedades (mensajes sin leer). Aparece con un pequeño rebote. */
export const Badge = ({ count, style }: { count: number; style?: StyleProp<ViewStyle> }) => {
  const c = usePalette();
  if (count <= 0) return null;
  return (
    <Animated.View entering={ZoomIn.springify().damping(12)} exiting={ZoomOut.duration(120)} style={style}>
      <View style={[styles.badge, { backgroundColor: c.danger, borderColor: c.background }]}>
        <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  text: { color: '#FFFFFF', fontFamily: font.bold, fontSize: 11, lineHeight: 13 },
});
