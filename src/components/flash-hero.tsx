import { Bell, Camera, Zap } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useLang } from '@/application/use-lang';
import { brand, space, type, usePalette } from '@/constants/theme';
import { WINDOW_MINUTES, WINDOW_RANGE, type WindowPhase } from '@/domain/flash-window';

import { FlashRing } from './flash-ring';
import { clock, mmss } from './time-format';
import { Button, Card, Txt } from './ui';

type FlashHeroProps = {
  phase: WindowPhase;
  remaining: number;
  windowStart: number;
  onCapture: () => void;
  /** Si el aviso diario está apagado, se ofrece activarlo con un toque mientras esperas. */
  onEnableReminders?: () => void;
};

/** Tarjeta protagonista cuando aún no publicas: anillo, cuenta regresiva y botón de cámara. */
export const FlashHero = ({ phase, remaining, windowStart, onCapture, onEnableReminders }: FlashHeroProps) => {
  const c = usePalette();
  const { t } = useLang();
  const copy = {
    waiting: { title: t.hero.waitingTitle, body: t.hero.waitingBody(WINDOW_RANGE.fromHour, WINDOW_RANGE.toHour, WINDOW_MINUTES) },
    open: { title: t.hero.openTitle, body: t.hero.openBody },
    closed: { title: t.hero.closedTitle, body: t.hero.closedBody },
  }[phase];
  const cta = { waiting: t.hero.postNow, open: t.hero.takePhoto, closed: t.hero.postLate }[phase];

  return (
    <Card style={styles.hero}>
      <FlashRing phase={phase} progress={remaining / (WINDOW_MINUTES * 60)}>
        <Animated.View key={phase} entering={FadeIn.duration(320)} style={styles.ringContent}>
          {phase === 'open' ? (
            <>
              <Zap size={26} color={brand.flash} fill={brand.flash} />
              <Txt style={[type.display, { fontVariant: ['tabular-nums'] }]}>{mmss(remaining)}</Txt>
              <Txt variant="footnote" color={c.secondary}>
                {t.hero.openRingSub}
              </Txt>
            </>
          ) : (
            <>
              <Txt variant="title2" center>
                {phase === 'waiting' ? t.hero.waitingRing : t.hero.closedRing}
              </Txt>
              <Txt variant="footnote" color={c.secondary} center>
                {phase === 'waiting' ? t.hero.waitingRingSub : t.hero.closedRingSub(clock(windowStart))}
              </Txt>
            </>
          )}
        </Animated.View>
      </FlashRing>
      <Animated.View key={`copy-${phase}`} entering={FadeInDown.duration(360)} style={styles.copy}>
        <Txt variant="title3" center>
          {copy.title}
        </Txt>
        <Txt variant="subhead" color={c.secondary} center>
          {copy.body}
        </Txt>
      </Animated.View>
      <View style={styles.actions}>
        <Button
          title={cta}
          variant={phase === 'open' ? 'flash' : phase === 'closed' ? 'primary' : 'secondary'}
          icon={<Camera size={20} color={phase === 'open' ? brand.flashInk : phase === 'closed' ? '#FFFFFF' : c.tint} />}
          onPress={onCapture}
        />
        {phase === 'waiting' && onEnableReminders ? (
          <Button title={t.hero.remindMe} variant="plain" compact icon={<Bell size={18} color={c.tint} />} onPress={onEnableReminders} />
        ) : null}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: space.xl, paddingVertical: space.xxl },
  ringContent: { alignItems: 'center', paddingHorizontal: space.xl },
  copy: { gap: 6, alignItems: 'center', paddingHorizontal: space.sm },
  actions: { alignSelf: 'stretch', gap: space.xs },
});
