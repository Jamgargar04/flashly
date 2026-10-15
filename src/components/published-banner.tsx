import { Image } from 'expo-image';
import { CircleCheck, Zap } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useLang } from '@/application/use-lang';
import { brand, radius, space, usePalette } from '@/constants/theme';
import type { WindowPhase } from '@/domain/flash-window';
import { timeToExpire, type Moment } from '@/domain/moment';

import { clock, durationLeft, mmss } from './time-format';
import { Card, Txt } from './ui';

type PublishedBannerProps = { own: Moment; phase: WindowPhase; remaining: number; now: number };

/**
 * Versión compacta del flash cuando ya publicaste: una línea con tu foto, la hora y cuánto le queda.
 * Mañana, cuando toque publicar de nuevo, vuelve la tarjeta completa.
 */
export const PublishedBanner = ({ own, phase, remaining, now }: PublishedBannerProps) => {
  const c = usePalette();
  const { t } = useLang();
  const posted = clock(own.createdAt);

  return (
    <Card padded={false} style={styles.banner}>
      <View style={[styles.thumb, { backgroundColor: c.media }]}>
        <Image source={own.back} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <View style={styles.inset}>
          <Image source={own.front} style={StyleSheet.absoluteFill} contentFit="cover" />
        </View>
      </View>
      <View style={styles.text}>
        <Txt variant="headline" numberOfLines={1}>
          {own.late ? t.hero.publishedLate(posted) : t.hero.published(posted)}
        </Txt>
        <Txt variant="footnote" color={c.secondary} numberOfLines={1}>
          {t.hero.expiresIn(durationLeft(t.time, timeToExpire(own, now)))}
        </Txt>
      </View>
      {phase === 'open' ? (
        <View style={styles.live} accessibilityLabel={t.hero.flashLive}>
          <Zap size={14} color={brand.flashInk} fill={brand.flashInk} />
          <Txt variant="caption" color={brand.flashInk} style={{ fontVariant: ['tabular-nums'] }}>
            {mmss(remaining)}
          </Txt>
        </View>
      ) : (
        <CircleCheck size={24} color={c.success} />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, paddingRight: space.lg },
  thumb: { width: 52, height: 52, borderRadius: radius.sm, borderCurve: 'continuous', overflow: 'hidden' },
  inset: {
    position: 'absolute', top: 4, left: 4, width: 18, height: 24, borderRadius: 4, overflow: 'hidden',
    borderWidth: 1, borderColor: '#FFFFFF',
  },
  text: { flex: 1, gap: 2 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: brand.flash, paddingHorizontal: 10, height: 28, borderRadius: radius.pill },
});
