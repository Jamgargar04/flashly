import { Image } from 'expo-image';
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useLang } from '@/application/use-lang';
import { radius, space, usePalette } from '@/constants/theme';

import { PressableScale, Txt } from '../ui';

type CoverPickerProps = { uri: string | null; onPick: () => void; onRemove: () => void };

/** Portada del evento: se elige de la galería (se sube a la nube al publicar), sin pegar URLs. */
export const CoverPicker = ({ uri, onPick, onRemove }: CoverPickerProps) => {
  const c = usePalette();
  const { t } = useLang();

  if (!uri) {
    return (
      <PressableScale onPress={onPick} haptic="light" accessibilityLabel={t.admin.addCover} style={[styles.empty, { borderColor: c.tint, backgroundColor: c.tintFill }]}>
        <ImagePlus size={32} color={c.tint} />
        <Txt variant="headline" color={c.tint}>
          {t.admin.addCover}
        </Txt>
        <Txt variant="footnote" color={c.secondary}>
          {t.admin.addCoverHint}
        </Txt>
      </PressableScale>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.preview}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      <View style={styles.actions}>
        <PressableScale onPress={onPick} haptic="light" accessibilityLabel={t.admin.changeCover} style={styles.action}>
          <RefreshCw size={15} color="#FFFFFF" />
          <Txt variant="subhead" color="#FFFFFF">
            {t.admin.changeCover}
          </Txt>
        </PressableScale>
        <PressableScale onPress={onRemove} haptic="light" accessibilityLabel={t.admin.removeCover} style={styles.action}>
          <Trash2 size={15} color="#FFFFFF" />
          <Txt variant="subhead" color="#FFFFFF">
            {t.admin.removeCover}
          </Txt>
        </PressableScale>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  empty: {
    aspectRatio: 16 / 9, borderRadius: radius.lg, borderCurve: 'continuous', borderWidth: 1.5, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  preview: { aspectRatio: 16 / 9, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden', backgroundColor: '#14121F' },
  actions: { position: 'absolute', right: space.md, bottom: space.md, flexDirection: 'row', gap: space.sm },
  action: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, height: 34,
    borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.55)',
  },
});
