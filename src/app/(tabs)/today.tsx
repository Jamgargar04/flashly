import { router } from 'expo-router';
import { Sparkles, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDirectory } from '@/application/directory-store';
import { useFeed } from '@/application/feed-store';
import { useSession } from '@/application/session-store';
import { toast } from '@/application/toast-store';
import { useFlashWindow } from '@/application/use-flash-window';
import { useLang } from '@/application/use-lang';
import { useReminders } from '@/application/use-reminders';
import { ChatButton } from '@/components/chat-button';
import { FlashHero } from '@/components/flash-hero';
import { LockedFeed } from '@/components/locked-feed';
import { MomentList, MomentSkeletons } from '@/components/moment-list';
import { PublishedBanner } from '@/components/published-banner';
import { longDate } from '@/components/time-format';
import { EmptyState, LargeHeader, SectionHeader, SegmentedControl, Skeleton, Txt } from '@/components/ui';
import { radius, space, usePalette } from '@/constants/theme';
import { filterFeed } from '@/domain/moment';

type FeedMode = 'all' | 'following';

/** Lo que va debajo del encabezado del feed según el estado: bloqueado, cargando, vacío o la lista. */
const FeedBody = ({ mode }: { mode: FeedMode }) => {
  const { t } = useLang();
  const uid = useSession((s) => s.student?.uid ?? '');
  const own = useFeed((s) => s.own);
  const moments = useFeed((s) => s.moments);
  const feedLoaded = useFeed((s) => s.feedLoaded);
  const following = useDirectory((s) => s.following);
  const openCamera = () => router.push('/capture');

  if (!own) return <LockedFeed onPost={openCamera} />;
  if (!feedLoaded) return <MomentSkeletons />;

  const visible = filterFeed(moments, mode, following, uid);
  const onlyMine = visible.every((moment) => moment.authorId === uid);
  return (
    <View style={{ gap: space.lg }}>
      <MomentList moments={visible} />
      {onlyMine ? (
        mode === 'following' ? (
          <EmptyState
            icon={<Users size={24} color="#FFFFFF" />}
            title={t.today.followingEmptyTitle}
            body={t.today.followingEmptyBody}
            action={{ label: t.today.followingEmptyAction, onPress: () => router.navigate('/(tabs)/discover') }}
          />
        ) : (
          <EmptyState icon={<Sparkles size={24} color="#FFFFFF" />} title={t.today.emptyTitle} body={t.today.emptyBody} />
        )
      ) : null}
    </View>
  );
};

export default function Today() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const { window, phase, remaining, now } = useFlashWindow();
  const own = useFeed((s) => s.own);
  const ownLoaded = useFeed((s) => s.ownLoaded);
  const uid = useSession((s) => s.student?.uid ?? '');
  const moments = useFeed((s) => s.moments);
  const following = useDirectory((s) => s.following);
  const remindersOn = useReminders((s) => s.enabled);
  const [mode, setMode] = useState<FeedMode>('all');
  const momentsCount = filterFeed(moments, mode, following, uid).length;

  const enableReminders = async () => {
    const ok = await useReminders.getState().setEnabled(true).catch(() => false);
    if (ok) toast.success(t.profile.dailyReminderFooter);
    else toast.error(t.profile.permissionBody);
  };

  const hero = !ownLoaded ? (
    <Skeleton height={96} rounded={radius.lg} />
  ) : own ? (
    <Animated.View key="banner" entering={FadeIn.duration(300)}>
      <PublishedBanner own={own} phase={phase} remaining={remaining} now={now} />
    </Animated.View>
  ) : (
    <Animated.View key="hero" entering={FadeIn.duration(300)}>
      <FlashHero
        phase={phase}
        remaining={remaining}
        windowStart={window.start}
        onCapture={() => router.push('/capture')}
        onEnableReminders={remindersOn ? undefined : enableReminders}
      />
    </Animated.View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 120 }}>
      <LargeHeader title={t.today.header} subtitle={longDate(t.time, now)} right={<ChatButton />} />
      <View style={styles.content}>
        {hero}
        <Animated.View layout={LinearTransition.springify().damping(20)} style={{ gap: space.md }}>
          <SectionHeader
            title={t.today.moments}
            action={
              own && momentsCount > 0 ? (
                <Txt variant="subhead" color={c.secondary}>
                  {String(momentsCount)}
                </Txt>
              ) : null
            }
          />
          {own ? (
            <SegmentedControl
              options={[
                { value: 'all', label: t.today.all },
                { value: 'following', label: t.today.following },
              ]}
              value={mode}
              onChange={setMode}
            />
          ) : null}
          <FeedBody mode={mode} />
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.xl, gap: space.xxl },
});
