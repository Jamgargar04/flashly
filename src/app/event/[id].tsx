import { router, useLocalSearchParams } from 'expo-router';
import { Bell, BellRing, CalendarDays, CalendarX, Clock, MapPin, Trash2, X } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEventReminders } from '@/application/event-reminders-store';
import { useEvents } from '@/application/events-store';
import { useSession } from '@/application/session-store';
import { toast } from '@/application/toast-store';
import { useLang } from '@/application/use-lang';
import { useNow } from '@/application/use-now';
import { EventCover, usePlaceLabel } from '@/components/event-card';
import { useErrorText } from '@/components/localize-error';
import { longDate, timeRange } from '@/components/time-format';
import { Button, Chip, EmptyState, IconButton, SheetHeader, Txt } from '@/components/ui';
import { brand, space, system, usePalette } from '@/constants/theme';
import { eventStatus, type CampusEvent } from '@/domain/event';

const InfoRow = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <View style={styles.info}>
    {icon}
    <Txt variant="callout" style={{ flex: 1 }}>
      {text}
    </Txt>
  </View>
);

const ReminderButton = ({ event }: { event: CampusEvent }) => {
  const c = usePalette();
  const { t } = useLang();
  const on = useEventReminders((s) => s.ids.includes(event.id));
  const toggle = async () => {
    const result = await useEventReminders.getState().toggle(event).catch(() => 'denied' as const);
    const message = { on: t.event.reminderOn, off: t.event.reminderOff, 'too-late': t.event.reminderTooLate, denied: t.event.reminderDenied }[result];
    if (result === 'on' || result === 'off') toast.success(message);
    else toast.error(message);
  };
  return (
    <Button
      title={on ? t.event.reminding : t.event.remind}
      variant={on ? 'tinted' : 'primary'}
      icon={on ? <BellRing size={20} color={c.tint} /> : <Bell size={20} color="#FFFFFF" />}
      onPress={toggle}
    />
  );
};

export default function EventDetail() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const errorText = useErrorText();
  const placeLabel = usePlaceLabel();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEvents((s) => s.events.find((item) => item.id === id));
  const isAdmin = useSession((s) => s.student?.isAdmin === true);
  const now = useNow(30_000);

  if (!event) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <SheetHeader title={t.discover.events} onClose={() => router.back()} closeLabel={t.common.close} />
        <EmptyState bare icon={<CalendarX size={24} color="#FFFFFF" />} title={t.event.notFound} />
      </View>
    );
  }

  const status = eventStatus(event, now);
  const place = placeLabel(event.location);
  const confirmDelete = () =>
    Alert.alert(t.event.deleteTitle, t.event.deleteBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.event.deleteConfirm,
        style: 'destructive',
        onPress: () =>
          useEvents
            .getState()
            .remove(event.id)
            .then(() => {
              toast.success(t.event.deleted);
              router.back();
            })
            .catch((error: unknown) => toast.error(errorText(error))),
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xxl }}>
        <EventCover imageUri={event.imageUrl} />
        <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.body}>
          {status === 'live' ? <Chip label={t.event.live} color={system.red} textColor="#FFFFFF" /> : null}
          {status === 'soon' ? <Chip label={t.event.soon} color={brand.flash} textColor={brand.flashInk} /> : null}
          <Txt variant="title1">{event.title}</Txt>
          <View style={{ gap: space.md }}>
            <InfoRow icon={<CalendarDays size={20} color={c.tint} />} text={longDate(t.time, event.startsAt)} />
            <InfoRow icon={<Clock size={20} color={c.tint} />} text={timeRange(event.startsAt, event.endsAt)} />
            {place ? <InfoRow icon={<MapPin size={20} color={c.tint} />} text={place} /> : null}
          </View>
          {event.description ? (
            <View style={{ gap: space.xs }}>
              <Txt variant="headline">{t.event.about}</Txt>
              <Txt variant="body" color={c.secondary}>
                {event.description}
              </Txt>
            </View>
          ) : null}
          {status === 'live' || status === 'ended' ? (
            <Txt variant="footnote" color={c.secondary} center>
              {status === 'live' ? t.event.reminderTooLate : t.event.ended}
            </Txt>
          ) : (
            <ReminderButton event={event} />
          )}
          {isAdmin ? <Button title={t.event.deleteConfirm} variant="destructive" icon={<Trash2 size={18} color={c.danger} />} onPress={confirmDelete} /> : null}
        </Animated.View>
      </ScrollView>
      <View style={[styles.close, { top: insets.top + space.sm }]}>
        <IconButton icon={<X size={20} color="#FFFFFF" />} label={t.common.close} variant="glass" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: space.xl, gap: space.lg },
  info: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  close: { position: 'absolute', left: space.lg },
});
