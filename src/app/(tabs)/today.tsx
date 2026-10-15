import { router } from 'expo-router';
import { Camera, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLang } from '@/application/use-lang';
import { useFlashWindow } from '@/application/use-flash-window';
import { useTodayFeed } from '@/application/use-today-feed';
import { FlashRing } from '@/components/flash-ring';
import { LockedFeed } from '@/components/locked-feed';
import { MomentCard } from '@/components/moment-card';
import type { Moment } from '@/domain/moment';
import { clock, longDate, mmss } from '@/components/time-format';
import { Button, Card, LargeHeader, Txt } from '@/components/ui';
import { brand, space, usePalette } from '@/constants/theme';
import { WINDOW_MINUTES, WINDOW_RANGE, type WindowPhase } from '@/domain/flash-window';

const RingContent = ({ phase, remaining, published, start, t }: { phase: WindowPhase; remaining: number; published: boolean; start: number; t: ReturnType<typeof useLang>['t'] }) => {
  const c = usePalette();
  if (phase === 'open') {
    return (
      <View style={{ alignItems: 'center' }}>
        <Zap size={26} color={brand.flash} fill={brand.flash} />
        <Txt style={styles.timer}>{mmss(remaining)}</Txt>
        <Txt variant="footnote" color={c.secondary}>{t.today.ring_for}</Txt>
      </View>
    );
  }
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: space.xl }}>
      <Txt variant="title2" center>{phase === 'waiting' ? t.today.ring_not_yet : published ? t.today.ring_done : t.today.ring_publish}</Txt>
      <Txt variant="footnote" color={c.secondary} center>
        {phase === 'waiting' ? 'Puede ser en cualquier momento' : `La ventana fue a las ${clock(start)}`}
      </Txt>
    </View>
  );
};

export default function Today() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const { window, phase, remaining } = useFlashWindow();
  const { uid, published, moments, refresh, like, deleteMoment } = useTodayFeed(window.id, window.start);
  const [refreshing, setRefreshing] = useState(false);
  const canPublish = !published;
  const openCamera = () => router.push('/capture');

  const copy = {
    waiting: { title: t.today.waiting_title, body: t.today.waiting_body(WINDOW_RANGE.fromHour, WINDOW_RANGE.toHour, WINDOW_MINUTES) },
    open: { title: published ? t.today.open_title_published : t.today.open_title_unpublished, body: published ? t.today.open_body_published : t.today.open_body_unpublished },
    closed: { title: published ? t.today.closed_title_published : t.today.closed_title_unpublished, body: published ? t.today.closed_body_published : t.today.closed_body_unpublished },
  };

  const confirmDelete = (m: Moment) =>
    Alert.alert(t.today.delete_title, t.today.delete_message, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.today.delete_confirm, style: 'destructive', onPress: () => deleteMoment(m) },
    ]);

  const onRefresh = () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 120 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <LargeHeader title={t.today.header} subtitle={longDate()} />
      <View style={{ paddingHorizontal: space.xl, gap: space.xxl }}>
        <Card style={styles.hero}>
          <FlashRing phase={phase} progress={remaining / (WINDOW_MINUTES * 60)}>
            <Animated.View key={`${phase}-${published}`} entering={FadeIn.duration(320)} exiting={FadeOut.duration(160)}>
              <RingContent phase={phase} remaining={remaining} published={published} start={window.start} t={t} />
            </Animated.View>
          </FlashRing>
          <Animated.View key={`copy-${phase}-${published}`} entering={FadeInDown.duration(360)} style={{ gap: 6, alignItems: 'center' }}>
            <Txt variant="title3" center>{copy[phase].title}</Txt>
            <Txt variant="subhead" color={c.secondary} center>{copy[phase].body}</Txt>
          </Animated.View>
          {canPublish ? (
            <Animated.View entering={FadeInDown.springify().damping(16)} style={{ alignSelf: 'stretch' }}>
              <Button
                title={phase === 'open' ? t.today.take_photo : t.today.post_late}
                variant={phase === 'open' ? 'flash' : 'secondary'}
                icon={<Camera size={20} color={phase === 'open' ? brand.flashInk : c.tint} />}
                onPress={openCamera}
              />
            </Animated.View>
          ) : null}
        </Card>

        <View style={{ gap: space.md }}>
          <View style={styles.sectionHead}>
            <Txt variant="title2">{t.today.moments_section}</Txt>
            {published ? <Txt variant="subhead" color={c.secondary}>{moments.length}</Txt> : null}
          </View>
          {!published ? (
            <Animated.View exiting={FadeOut.duration(260)}>
              <LockedFeed canPost={canPublish} onPost={openCamera} />
            </Animated.View>
          ) : moments.length === 0 ? (
            <Card>
              <Txt variant="subhead" color={c.secondary} center>
                {t.today.moments_none}
              </Txt>
            </Card>
          ) : (
            moments.map((m, i) => (
              <Animated.View key={m.id} entering={FadeInDown.delay(Math.min(i, 6) * 70).springify().damping(18)} layout={LinearTransition.springify().damping(18)}>
                <MomentCard
                  moment={m}
                  uid={uid}
                  onLike={like}
                  onDelete={m.authorId === uid ? () => confirmDelete(m) : undefined}
                />
              </Animated.View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: space.xl, paddingVertical: space.xxl },
  timer: { fontFamily: 'Inter_800ExtraBold', fontSize: 56, lineHeight: 62, letterSpacing: -2, fontVariant: ['tabular-nums'] },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
});
