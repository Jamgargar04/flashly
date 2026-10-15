import { router } from 'expo-router';
import { CalendarDays, Trash2, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/application/session-store';
import { useLang } from '@/application/use-lang';
import { Button, Card, Field, Group, Row, Txt } from '@/components/ui';
import { brand, radius, space, usePalette } from '@/constants/theme';
import type { CampusEvent } from '@/domain/event';
import { services } from '@/infrastructure/container';

export default function Admin() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const student = useSession((s) => s.student);

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [when, setWhen] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    services.events.listUpcoming().then(setEvents).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!student?.isAdmin) { router.replace('/(tabs)/profile'); return; }
    refresh();
  }, [student, refresh]);

  const publish = async () => {
    if (!title.trim()) { setError(t.admin.error_title); return; }
    if (!when.trim()) { setError(t.admin.error_when); return; }
    setError('');
    setBusy(true);
    try {
      await services.events.create({
        title: title.trim(),
        description: description.trim() || undefined,
        when: when.trim(),
        location: location.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
      setTitle('');
      setDescription('');
      setWhen('');
      setLocation('');
      setImageUrl('');
      refresh();
    } catch {
      setError('No se pudo publicar. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = (event: CampusEvent) => {
    Alert.alert(t.admin.delete_title, t.admin.delete_message, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.admin.delete_confirm,
        style: 'destructive',
        onPress: () =>
          services.events
            .remove(event.id)
            .then(refresh)
            .catch(() => undefined),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + space.sm, borderBottomColor: c.separator, backgroundColor: c.card }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" style={styles.headerBtn}>
          <X size={22} color={c.label} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Txt variant="headline">{t.admin.header}</Txt>
          <Txt variant="caption" color={c.secondary}>{t.admin.subtitle}</Txt>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xxl, paddingBottom: insets.bottom + space.xxl }} keyboardShouldPersistTaps="handled">
        {/* Existing events */}
        <Group title={t.admin.events}>
          {events.length === 0 ? (
            <Txt variant="subhead" color={c.secondary} style={{ padding: space.md }}>Sin eventos activos.</Txt>
          ) : (
            events.map((e) => (
              <Row
                key={e.id}
                icon={<CalendarDays size={18} color="#FFFFFF" />}
                iconColor={brand.violet}
                title={e.title}
                value={e.when}
                right={
                  <Pressable onPress={() => confirmDelete(e)} hitSlop={8} style={styles.deleteBtn}>
                    <Trash2 size={18} color={c.danger} />
                  </Pressable>
                }
              />
            ))
          )}
        </Group>

        {/* Create form */}
        <Card style={{ gap: space.lg }}>
          <Txt variant="headline">{t.admin.new_event}</Txt>
          <Field label={t.admin.title_label} value={title} onChangeText={setTitle} placeholder={t.admin.title_placeholder} />
          <Field label={t.admin.description_label} value={description} onChangeText={setDescription} placeholder={t.admin.description_placeholder} multiline />
          <Field label={t.admin.when_label} value={when} onChangeText={setWhen} placeholder={t.admin.when_placeholder} />
          <Field label={t.admin.location_label} value={location} onChangeText={setLocation} placeholder={t.admin.location_placeholder} />
          <Field label={t.admin.image_label} value={imageUrl} onChangeText={setImageUrl} placeholder={t.admin.image_placeholder} autoCapitalize="none" keyboardType="url" />
          {error ? <Txt variant="footnote" color={c.danger}>{error}</Txt> : null}
          <Button title={t.admin.publish} onPress={publish} loading={busy} disabled={!title.trim() || !when.trim()} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingBottom: space.md, borderBottomWidth: StyleSheet.hairlineWidth },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { padding: 4 },
});
