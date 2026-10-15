import { router, useLocalSearchParams } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFeed } from '@/application/feed-store';
import { useLang } from '@/application/use-lang';
import { LockedFeed } from '@/components/locked-feed';
import { MomentList } from '@/components/moment-list';
import { EmptyState, SheetHeader } from '@/components/ui';
import { space, usePalette } from '@/constants/theme';
import { isCampusPlace } from '@/domain/place';

/** Momentos de hoy publicados desde un lugar del campus, en vivo. */
export default function PlaceMoments() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const { name } = useLocalSearchParams<{ name: string }>();
  const locked = useFeed((s) => s.own === null);
  const moments = useFeed((s) => s.moments).filter((moment) => moment.location === name);
  const title = isCampusPlace(name) ? t.places[name] : String(name ?? '');

  const goCapture = () => {
    router.back();
    router.push('/capture');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SheetHeader
        title={title}
        subtitle={locked ? t.today.lockedTitle : t.place.count(moments.length)}
        onClose={() => router.back()}
        closeLabel={t.common.close}
      />
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: insets.bottom + space.xxl }}>
        {locked ? (
          <LockedFeed onPost={goCapture} />
        ) : moments.length === 0 ? (
          <EmptyState icon={<MapPin size={24} color="#FFFFFF" />} title={t.place.empty} />
        ) : (
          <MomentList moments={moments} />
        )}
      </ScrollView>
    </View>
  );
}
