import { router, useFocusEffect } from 'expo-router';
import { Bell, LogOut, Moon, Pencil, RotateCcw, Shield, ShieldCheck, Type, Zap } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appInfo } from '@/application/app-info';
import { PREFERENCES } from '@/application/preference-keys';
import { useSession } from '@/application/session-store';
import { usePreference } from '@/application/use-preference';
import { usePublishedToday } from '@/application/use-published-today';
import { useReminders } from '@/application/use-reminders';
import { useTheme } from '@/application/use-theme';
import { useFontSize } from '@/application/use-font-size';
import { useLang } from '@/application/use-lang';
import { Avatar, Button, Card, Chip, Group, LargeHeader, Row, Txt } from '@/components/ui';
import { brand, space, usePalette } from '@/constants/theme';

const PRIVACY =
  'Flashly guarda tu nombre, grupo, correo institucional y las fotos que publicas. Las publicaciones dejan de mostrarse a las 24 horas. No compartimos tus datos con terceros.';

export default function Profile() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const student = useSession((s) => s.student);
  const signOut = useSession((s) => s.signOut);
  const windowOverride = useSession((s) => s.windowOverride);
  const setWindowOverride = useSession((s) => s.setWindowOverride);
  const published = usePublishedToday();
  const [friends, , reloadFriends] = usePreference<string[]>(PREFERENCES.friends, []);
  const reminders = useReminders();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { isLarge, toggle: toggleFontSize } = useFontSize();
  const { t, lang, toggleLang } = useLang();

  useFocusEffect(reloadFriends);

  const onToggleReminders = async (value: boolean) => {
    const ok = await reminders.toggle(value);
    if (!ok) Alert.alert('Permiso necesario', 'Activa las notificaciones de Flashly en los ajustes del teléfono.');
  };

  const onOpenNow = async () => {
    await reminders.openWindowNow();
    Alert.alert(t.profile.open_now_confirm, t.profile.open_now_msg);
  };

  const onSignOut = () =>
    Alert.alert(t.profile.sign_out_title, t.profile.sign_out_message, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.profile.sign_out_confirm, style: 'destructive', onPress: () => signOut().then(() => router.replace('/login')) },
    ]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 120 }}>
      <LargeHeader title={t.profile.header} />
      <View style={{ paddingHorizontal: space.xl, gap: space.xxl }}>
        <Card style={styles.profile}>
          <Avatar name={student?.name ?? ''} size={84} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Txt variant="title2" center>{student?.name || 'Sin nombre'}</Txt>
            <Txt variant="footnote" color={c.secondary} center>{student?.email}</Txt>
            {student?.bio ? <Txt variant="subhead" color={c.secondary} center>{student.bio}</Txt> : null}
          </View>
          {student?.group ? <Chip label={student.group} /> : null}
          <Button title={t.profile.edit_profile} variant="secondary" compact icon={<Pencil size={16} color={c.tint} />} onPress={() => router.push('/edit-profile')} style={{ alignSelf: 'stretch' }} />
          <View style={[styles.stats, { borderTopColor: c.separator }]}>
            <View style={styles.stat}>
              <Txt variant="title2">{published ? '1' : '0'}</Txt>
              <Txt variant="caption" color={c.secondary}>{t.profile.moments_today}</Txt>
            </View>
            <View style={[styles.statDivider, { backgroundColor: c.separator }]} />
            <View style={styles.stat}>
              <Txt variant="title2">{friends.length}</Txt>
              <Txt variant="caption" color={c.secondary}>{t.profile.classmates}</Txt>
            </View>
          </View>
        </Card>

        <Group title={t.profile.appearance}>
          <Row
            icon={<Moon size={18} color="#FFFFFF" />}
            iconColor="#5856D6"
            title={t.profile.dark_mode}
            right={<Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: brand.violet }} />}
          />
          <Row
            icon={<Type size={18} color="#FFFFFF" />}
            iconColor="#FF9500"
            title={t.profile.large_text}
            right={<Switch value={isLarge} onValueChange={toggleFontSize} trackColor={{ true: brand.violet }} />}
          />
          <Row
            icon={<Txt variant="headline" color="#FFFFFF">{lang === 'es' ? 'A' : 'A'}</Txt>}
            iconColor="#007AFF"
            title={t.profile.language}
            value={lang === 'es' ? t.profile.lang_es : t.profile.lang_en}
            onPress={toggleLang}
          />
        </Group>

        <Group title={t.profile.notifications} footer={t.profile.notif_footer}>
          <Row
            icon={<Bell size={18} color="#FFFFFF" />}
            iconColor="#FF3B30"
            title={t.profile.daily_reminder}
            right={<Switch value={reminders.enabled} onValueChange={onToggleReminders} trackColor={{ true: brand.violet }} />}
          />
        </Group>

        <Group title={t.profile.flash_now} footer={t.profile.flash_now_footer}>
          <Row icon={<Zap size={18} color="#FFFFFF" />} iconColor={brand.flash} title={t.profile.open_now} onPress={onOpenNow} />
          {windowOverride ? (
            <Row icon={<RotateCcw size={18} color="#FFFFFF" />} iconColor="#8E8E93" title={t.profile.reset_window} onPress={() => setWindowOverride(null)} />
          ) : null}
        </Group>

        {student?.isAdmin ? (
          <Group>
            <Row icon={<ShieldCheck size={18} color="#FFFFFF" />} iconColor={brand.violet} title="Panel de administrador" onPress={() => router.push('/admin')} />
          </Group>
        ) : null}

        <Group>
          <Row icon={<Shield size={18} color="#FFFFFF" />} iconColor="#34C759" title={t.profile.privacy} onPress={() => Alert.alert(t.profile.privacy, t.profile.privacy_text)} />
          <Row icon={<LogOut size={18} color="#FFFFFF" />} iconColor="#8E8E93" title={t.profile.sign_out} destructive onPress={onSignOut} />
        </Group>

        <Txt variant="footnote" color={c.tertiary} center>
          Flashly {appInfo.version} · {appInfo.summary}
        </Txt>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center', gap: space.md, paddingTop: space.xxl },
  stats: { flexDirection: 'row', alignSelf: 'stretch', borderTopWidth: StyleSheet.hairlineWidth, marginTop: space.sm, paddingTop: space.lg },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: StyleSheet.hairlineWidth },
});
