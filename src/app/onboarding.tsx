import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/application/session-store';
import { useLang } from '@/application/use-lang';
import { Button, Txt } from '@/components/ui';
import { motion, space, usePalette } from '@/constants/theme';

const IMAGES = [require('@/assets/onboarding/one.png'), require('@/assets/onboarding/two.png'), require('@/assets/onboarding/three.png')];

export default function Onboarding() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const { width } = useWindowDimensions();
  const finishOnboarding = useSession((s) => s.finishOnboarding);
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList>(null);
  const slides = t.onboarding.slides.map((slide, i) => ({ ...slide, image: IMAGES[i] }));
  const last = index === slides.length - 1;

  const done = async () => {
    await finishOnboarding();
    router.replace('/login');
  };

  const next = () => {
    list.current?.scrollToIndex({ index: index + 1 });
    setIndex(index + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background, paddingTop: insets.top, paddingBottom: insets.bottom + space.lg }}>
      <View style={styles.top}>
        {!last ? (
          <Pressable onPress={done} hitSlop={12} accessibilityRole="button">
            <Txt variant="callout" color={c.tint}>
              {t.onboarding.skip}
            </Txt>
          </Pressable>
        ) : null}
      </View>
      <FlatList
        ref={list}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: space.xxl, alignItems: 'center' }}>
            <Image source={item.image} style={{ width: width - 40, height: width - 40, maxHeight: 420, maxWidth: 420 }} contentFit="contain" />
            <Txt variant="title1" center style={{ marginTop: space.xl }}>
              {item.title}
            </Txt>
            <Txt variant="body" color={c.secondary} center style={{ marginTop: space.md }}>
              {item.body}
            </Txt>
          </View>
        )}
      />
      <View style={styles.dots}>
        {slides.map((slide, i) => (
          <Animated.View
            key={slide.title}
            layout={LinearTransition.springify().damping(motion.spring.snappy.damping)}
            style={[styles.dot, { backgroundColor: i === index ? c.tint : c.tertiary, width: i === index ? 24 : 8 }]}
          />
        ))}
      </View>
      <View style={{ paddingHorizontal: space.xl }}>
        <Button
          title={last ? t.onboarding.start : t.onboarding.next}
          onPress={last ? done : next}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { height: 44, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: space.xl },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: space.xl },
  dot: { height: 8, borderRadius: 4 },
});
