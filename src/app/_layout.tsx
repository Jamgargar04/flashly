import {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, useFonts,
} from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { usePreferences } from '@/application/preferences-store';
import { useSession } from '@/application/session-store';
import { useLiveData } from '@/application/use-live-data';
import { ToastHost } from '@/components/toast-host';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const MODAL = { presentation: 'modal', animation: 'slide_from_bottom' } as const;

/** Suscripciones en vivo de la sesión (feed, chat, eventos, personas), abiertas una sola vez para toda la app. */
const LiveData = ({ uid }: { uid: string }) => {
  useLiveData(uid);
  return null;
};

export default function RootLayout() {
  const scheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold });
  const hydrated = usePreferences((s) => s.hydrated);
  // Solo con correo verificado: las reglas de Firestore no dejan leer el feed ni el chat antes.
  const liveUid = useSession((s) => (s.student?.verified ? s.student.uid : null));
  // Si una fuente falla, la app arranca igual con la fuente del sistema (nunca se queda en blanco).
  const ready = (fontsLoaded || fontError !== null) && hydrated;

  // Tema, idioma y tamaño de texto se cargan antes de mostrar la app: sin parpadeos.
  useEffect(() => {
    usePreferences.getState().hydrate().catch(() => usePreferences.setState({ hydrated: true }));
  }, []);

  useEffect(() => useSession.getState().start(), []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={{ ...base, colors: { ...base.colors, background: scheme === 'dark' ? '#000000' : '#F2F2F7' } }}>
        <StatusBar style="auto" />
        {liveUid ? <LiveData uid={liveUid} /> : null}
        <Stack screenOptions={{ headerShown: false, animation: 'ios_from_right' }}>
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="login" options={{ animation: 'fade' }} />
          <Stack.Screen name="verify" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="capture" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', gestureEnabled: false }} />
          <Stack.Screen name="campus-chat" />
          <Stack.Screen name="edit-profile" options={MODAL} />
          <Stack.Screen name="admin" options={MODAL} />
          <Stack.Screen name="event/[id]" options={MODAL} />
          <Stack.Screen name="place/[name]" options={MODAL} />
          <Stack.Screen name="user/[id]" options={MODAL} />
        </Stack>
        <ToastHost />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
