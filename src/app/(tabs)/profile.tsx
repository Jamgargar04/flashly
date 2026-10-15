import { router, useFocusEffect } from 'expo-router';
import { Bell, LogOut, Moon, RotateCcw, Shield, Zap } from 'lucide-react-native';
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
import { Avatar, Card, Chip, Group, LargeHeader, Row, Txt } from '@/components/ui';
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

  useFocusEffect(reloadFriends);

  const onToggleReminders = async (value: boolean) => {
    const ok = await reminders.toggle(value);
    if (!ok) Alert.alert('Permiso necesario', 'Activa las notificaciones de Flashly en los ajustes del teléfono.');
  };

  const onOpenNow = async () => {
    await reminders.openWindowNow();
    Alert.alert('Listo', 'La ventana se abre en 5 segundos. Ve a la pestaña Hoy.');
  };

  const onSignOut = () =>
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut().then(() => router.replace('/login')) },
    ]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 120 }}>
      <LargeHeader title="Perfil" />
      <View style={{ paddingHorizontal: space.xl, gap: space.xxl }}>
        <Card style={styles.profile}>
          <Avatar name={student?.name ?? ''} size={84} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Txt variant="title2" center>{student?.name || 'Sin nombre'}</Txt>
            <Txt variant="footnote" color={c.secondary} center>{student?.email}</Txt>
          </View>
          {student?.group ? <Chip label={student.group} /> : null}
          <View style={[styles.stats, { borderTopColor: c.separator }]}>
            <View style={styles.stat}>
              <Txt variant="title2">{published ? '1' : '0'}</Txt>
              <Txt variant="caption" color={c.secondary}>Momentos hoy</Txt>
            </View>
            <View style={[styles.statDivider, { backgroundColor: c.separator }]} />
            <View style={styles.stat}>
              <Txt variant="title2">{friends.length}</Txt>
              <Txt variant="caption" color={c.secondary}>Compañeros</Txt>
            </View>
          </View>
        </Card>

        <Group title="Apariencia">
          <Row
            icon={<Moon size={18} color="#FFFFFF" />}
            iconColor="#5856D6"
            title="Modo oscuro"
            right={<Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: brand.violet }} />}
          />
        </Group>

        <Group title="Notificaciones" footer="Programa en tu teléfono el aviso sorpresa de los próximos días.">
          <Row
            icon={<Bell size={18} color="#FFFFFF" />}
            iconColor="#FF3B30"
            title="Aviso diario"
            right={<Switch value={reminders.enabled} onValueChange={onToggleReminders} trackColor={{ true: brand.violet }} />}
          />
        </Group>

        <Group title="Flash ahora" footer="Abre la ventana de 2 minutos sin esperar la hora sorpresa.">
          <Row icon={<Zap size={18} color="#FFFFFF" />} iconColor={brand.flash} title="Abrir la ventana ahora" onPress={onOpenNow} />
          {windowOverride ? (
            <Row icon={<RotateCcw size={18} color="#FFFFFF" />} iconColor="#8E8E93" title="Volver a la hora sorpresa" onPress={() => setWindowOverride(null)} />
          ) : null}
        </Group>

        <Group>
          <Row icon={<Shield size={18} color="#FFFFFF" />} iconColor="#34C759" title="Aviso de privacidad" onPress={() => Alert.alert('Aviso de privacidad', PRIVACY)} />
          <Row icon={<LogOut size={18} color="#FFFFFF" />} iconColor="#8E8E93" title="Cerrar sesión" destructive onPress={onSignOut} />
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
