import { router } from 'expo-router';
import { CalendarDays, RotateCcw, Trash2, Zap } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEvents } from '@/application/events-store';
import { useSession } from '@/application/session-store';
import { toast } from '@/application/toast-store';
import { useLang } from '@/application/use-lang';
import { useNow } from '@/application/use-now';
import { useReminders } from '@/application/use-reminders';
import { EventForm } from '@/components/event-form/event-form';
import { useErrorText } from '@/components/localize-error';
import { relativeDay, timeRange } from '@/components/time-format';
import { Group, IconButton, Row, SheetHeader, Txt } from '@/components/ui';
import { brand, space, system, usePalette } from '@/constants/theme';
import { upcomingEvents, type CampusEvent } from '@/domain/event';

/** Eventos activos con opción de borrarlos. */
const ActiveEvents = () => {
  const c = usePalette();
  const { t } = useLang();
  const errorText = useErrorText();
  const now = useNow(30_000);
  const events = upcomingEvents(useEvents((s) => s.events), now);

  const confirmDelete = (event: CampusEvent) =>
    Alert.alert(t.event.deleteTitle, t.event.deleteBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.event.deleteConfirm,
        style: 'destructive',
        onPress: () =>
          useEvents
            .getState()
            .remove(event.id)
            .then(() => toast.success(t.event.deleted))
            .catch((error: unknown) => toast.error(errorText(error))),
      },
    ]);

  return (
    <Group title={t.admin.active}>
      {events.length === 0 ? (
        <Txt variant="subhead" color={c.secondary} style={{ padding: space.lg }}>
          {t.admin.activeEmpty}
        </Txt>
      ) : (
        events.map((event) => (
          <Row
            key={event.id}
            icon={<CalendarDays size={18} color="#FFFFFF" />}
            iconColor={brand.violet}
            title={event.title}
            subtitle={`${relativeDay(t.time, event.startsAt)} · ${timeRange(event.startsAt, event.endsAt)}`}
            right={<IconButton icon={<Trash2 size={18} color={c.danger} />} label={t.event.deleteConfirm} variant="plain" size={34} onPress={() => confirmDelete(event)} />}
          />
        ))
      )}
    </Group>
  );
};

/** Abrir la ventana del flash al momento, para probar la app sin esperar la hora sorpresa. */
const TestingTools = () => {
  const { t } = useLang();
  const windowOverride = useSession((s) => s.windowOverride);
  return (
    <Group title={t.admin.tools} footer={t.admin.toolsFooter}>
      <Row
        icon={<Zap size={18} color="#FFFFFF" />}
        iconColor={brand.flash}
        title={t.admin.openNow}
        onPress={() =>
          useReminders
            .getState()
            .openWindowNow()
            .then(() => toast.info(t.admin.openNowDone))
            .catch(() => toast.error(t.errors.generic))
        }
      />
      {windowOverride ? (
        <Row
          icon={<RotateCcw size={18} color="#FFFFFF" />}
          iconColor={system.gray}
          title={t.admin.resetWindow}
          onPress={() =>
            useReminders
              .getState()
              .resetWindow()
              .then(() => toast.success(t.admin.resetDone))
              .catch(() => toast.error(t.errors.generic))
          }
        />
      ) : null}
    </Group>
  );
};

export default function Admin() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const isAdmin = useSession((s) => s.student?.isAdmin === true);

  useEffect(() => {
    if (isAdmin) return;
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.background }} behavior="padding">
      <SheetHeader title={t.admin.header} subtitle={t.admin.subtitle} onClose={() => router.back()} closeLabel={t.common.close} />
      <ScrollView
        contentContainerStyle={{ padding: space.xl, gap: space.xxl, paddingBottom: insets.bottom + space.xxl }}
        keyboardShouldPersistTaps="handled">
        <EventForm />
        <ActiveEvents />
        <TestingTools />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
