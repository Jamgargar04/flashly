import { router } from 'expo-router';
import { CalendarDays, Plus } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useEvents } from '@/application/events-store';
import { useSession } from '@/application/session-store';
import { useLang } from '@/application/use-lang';
import { radius, space, usePalette } from '@/constants/theme';
import { upcomingEvents } from '@/domain/event';

import { EventCard } from '../event-card';
import { Button, EmptyState, SectionHeader, Skeleton } from '../ui';

/** Carrusel de eventos en vivo; los que ya terminaron desaparecen solos. */
export const EventsSection = ({ now }: { now: number }) => {
  const c = usePalette();
  const { t } = useLang();
  const { width } = useWindowDimensions();
  const isAdmin = useSession((s) => s.student?.isAdmin === true);
  const loaded = useEvents((s) => s.loaded);
  const events = upcomingEvents(useEvents((s) => s.events), now);
  const cardWidth = Math.min(340, width * 0.8);
  const openAdmin = () => router.push('/admin');

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.pad}>
        <SectionHeader
          title={t.discover.events}
          action={isAdmin ? <Button title={t.discover.createEvent} variant="tinted" compact icon={<Plus size={18} color={c.tint} />} onPress={openAdmin} /> : null}
        />
      </View>
      {!loaded ? (
        <View style={styles.pad}>
          <Skeleton height={cardWidth * 0.82} rounded={radius.lg} />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.pad}>
          <EmptyState
            icon={<CalendarDays size={24} color="#FFFFFF" />}
            title={t.discover.eventsEmptyTitle}
            body={t.discover.eventsEmptyBody}
            action={isAdmin ? { label: t.discover.createEvent, onPress: openAdmin } : undefined}
          />
        </View>
      ) : (
        <FlatList
          horizontal
          data={events}
          keyExtractor={(event) => event.id}
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + space.md}
          decelerationRate="fast"
          contentContainerStyle={styles.carousel}
          renderItem={({ item }) => (
            <EventCard event={item} now={now} width={cardWidth} onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.id } })} />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.xl },
  carousel: { paddingHorizontal: space.xl, gap: space.md, paddingBottom: space.sm },
});
