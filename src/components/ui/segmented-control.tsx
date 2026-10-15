import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { elevation, font, motion, usePalette } from '@/constants/theme';

import { Txt } from './text';

type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

const PADDING = 2;

/** Control segmentado de iOS: la selección se desliza con un resorte. */
export const SegmentedControl = <T extends string>({ options, value, onChange, style }: SegmentedControlProps<T>) => {
  const c = usePalette();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const segment = width > 0 ? (width - PADDING * 2) / options.length : 0;
  const x = useSharedValue(0);
  const measured = useRef(false);

  useEffect(() => {
    if (segment === 0) return;
    // La primera vez se coloca sin animar; después, se desliza.
    x.value = measured.current ? withSpring(index * segment, motion.spring.snappy) : index * segment;
    measured.current = true;
  }, [index, segment, x]);

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityRole="tablist"
      style={[styles.track, { backgroundColor: c.fill }, style]}>
      {segment > 0 ? (
        <Animated.View
          style={[styles.thumb, { width: segment, backgroundColor: c.scheme === 'dark' ? c.elevated : c.card }, c.scheme === 'light' && elevation.card, thumbStyle]}
        />
      ) : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={styles.segment}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              Haptics.selectionAsync().catch(() => undefined);
              onChange(option.value);
            }}>
            <Txt variant="subhead" numberOfLines={1} style={{ fontFamily: selected ? font.semibold : font.medium }}>
              {option.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  track: { flexDirection: 'row', height: 36, borderRadius: 10, borderCurve: 'continuous', padding: PADDING },
  thumb: { position: 'absolute', top: PADDING, bottom: PADDING, left: PADDING, borderRadius: 8, borderCurve: 'continuous' },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
});
