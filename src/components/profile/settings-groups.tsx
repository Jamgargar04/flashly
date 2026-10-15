import { router } from 'expo-router';
import { Bell, Languages, LogOut, Moon, Shield, ShieldCheck, Type } from 'lucide-react-native';
import React from 'react';
import { Alert, Linking, StyleSheet, Switch, View } from 'react-native';

import { usePreferences, type ThemeChoice } from '@/application/preferences-store';
import { useSession } from '@/application/session-store';
import { useLang } from '@/application/use-lang';
import { useReminders } from '@/application/use-reminders';
import type { Lang } from '@/constants/strings';
import { brand, space, system, usePalette } from '@/constants/theme';

import { Group, Row, SegmentedControl, Txt } from '../ui';

/** Fila con un control segmentado debajo del título (Tema, Idioma). */
const ChoiceRow = ({ icon, iconColor, title, children }: { icon: React.ReactNode; iconColor: string; title: string; children: React.ReactNode }) => (
  <View style={styles.choiceRow}>
    <View style={styles.choiceTitle}>
      <View style={[styles.rowIcon, { backgroundColor: iconColor }]}>{icon}</View>
      <Txt>{title}</Txt>
    </View>
    {children}
  </View>
);

export const AppearanceGroup = () => {
  const { t } = useLang();
  const theme = usePreferences((s) => s.theme);
  const lang = usePreferences((s) => s.lang);
  const largeText = usePreferences((s) => s.largeText);
  const { setTheme, setLang, setLargeText } = usePreferences.getState();

  return (
    <Group title={t.profile.appearance}>
      <ChoiceRow icon={<Moon size={18} color="#FFFFFF" />} iconColor={system.indigo} title={t.profile.theme}>
        <SegmentedControl<ThemeChoice>
          options={[
            { value: 'system', label: t.profile.themeSystem },
            { value: 'light', label: t.profile.themeLight },
            { value: 'dark', label: t.profile.themeDark },
          ]}
          value={theme}
          onChange={setTheme}
        />
      </ChoiceRow>
      <ChoiceRow icon={<Languages size={18} color="#FFFFFF" />} iconColor={system.blue} title={t.profile.language}>
        <SegmentedControl<Lang>
          options={[
            { value: 'es', label: 'Español' },
            { value: 'en', label: 'English' },
          ]}
          value={lang}
          onChange={setLang}
        />
      </ChoiceRow>
      <Row
        icon={<Type size={18} color="#FFFFFF" />}
        iconColor={system.orange}
        title={t.profile.largeText}
        right={<Switch value={largeText} onValueChange={setLargeText} trackColor={{ true: brand.violet }} accessibilityLabel={t.profile.largeText} />}
      />
    </Group>
  );
};

export const NotificationsGroup = () => {
  const { t } = useLang();
  const enabled = useReminders((s) => s.enabled);

  const toggle = async (value: boolean) => {
    const ok = await useReminders.getState().setEnabled(value).catch(() => false);
    if (ok) return;
    Alert.alert(t.profile.permissionTitle, t.profile.permissionBody, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.openSettings, onPress: () => Linking.openSettings().catch(() => undefined) },
    ]);
  };

  return (
    <Group title={t.profile.notifications} footer={t.profile.dailyReminderFooter}>
      <Row
        icon={<Bell size={18} color="#FFFFFF" />}
        iconColor={system.red}
        title={t.profile.dailyReminder}
        right={<Switch value={enabled} onValueChange={toggle} trackColor={{ true: brand.violet }} accessibilityLabel={t.profile.dailyReminder} />}
      />
    </Group>
  );
};

export const AccountGroup = () => {
  const { t } = useLang();
  const isAdmin = useSession((s) => s.student?.isAdmin === true);
  const signOut = useSession((s) => s.signOut);

  const confirmSignOut = () =>
    Alert.alert(t.profile.signOutTitle, t.profile.signOutBody, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.profile.signOut, style: 'destructive', onPress: () => signOut().then(() => router.replace('/login')) },
    ]);

  return (
    <>
      {isAdmin ? (
        <Group>
          <Row icon={<ShieldCheck size={18} color="#FFFFFF" />} iconColor={brand.violet} title={t.profile.admin} onPress={() => router.push('/admin')} />
        </Group>
      ) : null}
      <Group title={t.profile.account}>
        <Row icon={<Shield size={18} color="#FFFFFF" />} iconColor={system.green} title={t.profile.privacy} onPress={() => Alert.alert(t.profile.privacy, t.profile.privacyBody)} />
        <Row icon={<LogOut size={18} color="#FFFFFF" />} iconColor={system.gray} title={t.profile.signOut} destructive onPress={confirmSignOut} />
      </Group>
    </>
  );
};

const styles = StyleSheet.create({
  choiceRow: { paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.md },
  choiceTitle: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  rowIcon: { width: 30, height: 30, borderRadius: 8, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
});
