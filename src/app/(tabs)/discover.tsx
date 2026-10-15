import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLang } from '@/application/use-lang';
import { useNow } from '@/application/use-now';
import { ChatButton } from '@/components/chat-button';
import { EventsSection } from '@/components/discover/events-section';
import { PeopleSection } from '@/components/discover/people-section';
import { PlacesSection } from '@/components/discover/places-section';
import { LargeHeader } from '@/components/ui';
import { space, usePalette } from '@/constants/theme';

export default function Discover() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const now = useNow(60_000);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 120, gap: space.xxl }}>
      <LargeHeader title={t.discover.header} subtitle={t.discover.subtitle} right={<ChatButton />} />
      <EventsSection now={now} />
      <PlacesSection />
      <PeopleSection />
    </ScrollView>
  );
}
