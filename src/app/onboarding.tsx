import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Txt } from '@/components/ui';
import { space, usePalette } from '@/constants/theme';
import { useSession } from '@/application/session-store';

const SLIDES = [
  {
    image: require('@/assets/onboarding/one.png'),
    title: 'Conoce a tu generación',
    body: 'Llevas años en la misma escuela y apenas conoces a unos cuantos. Flashly te muestra quién más está en el campus.',
  },
  {
    image: require('@/assets/onboarding/two.png'),
    title: 'Un aviso sorpresa al día',
    body: 'A una hora distinta cada día, todos reciben la misma alerta. Tienes 2 minutos para mostrar qué estás haciendo.',
  },
  {
    image: require('@/assets/onboarding/three.png'),
    title: 'Si no publicas, no ves',
    body: 'Para ver los momentos de tus compañeros, primero comparte el tuyo. Todo se borra en 24 horas.',
  },
];

export default function Onboarding() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const finishOnboarding = useSession((s) => s.finishOnboarding);
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList>(null);
  const last = index === SLIDES.length - 1;

  const done = async () => {
    await finishOnboarding();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background, paddingTop: insets.top, paddingBottom: insets.bottom + space.lg }}>
      <View style={styles.top}>
        {!last ? (
          <Pressable onPress={done} hitSlop={12} accessibilityRole="button">
            <Txt variant="callout" color={c.tint}>
              Omitir
            </Txt>
          </Pressable>
        ) : null}
      </View>
      <FlatList
        ref={list}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
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
        {SLIDES.map((s, i) => (
          <View key={s.title} style={[styles.dot, { backgroundColor: i === index ? c.label : c.tertiary, width: i === index ? 22 : 8 }]} />
        ))}
      </View>
      <View style={{ paddingHorizontal: space.xl }}>
        <Button
          title={last ? 'Empezar' : 'Continuar'}
          onPress={() => (last ? done() : list.current?.scrollToIndex({ index: index + 1 }))}
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
