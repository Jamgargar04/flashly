import { router } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/application/session-store';
import { toast } from '@/application/toast-store';
import { useLang } from '@/application/use-lang';
import { useVerificationPoll } from '@/application/use-verification-poll';
import { Button, Txt } from '@/components/ui';
import { space, usePalette } from '@/constants/theme';

const RESEND_COOLDOWN = 60;

/** Sobre que "flota" mientras se espera la verificación. */
const FloatingMail = () => {
  const c = usePalette();
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(withTiming(-8, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={style}>
      <MailCheck size={64} color={c.tint} />
    </Animated.View>
  );
};

export default function Verify() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const email = useSession((s) => s.student?.email);
  const refreshVerification = useSession((s) => s.refreshVerification);
  const resendVerification = useSession((s) => s.resendVerification);
  const signOut = useSession((s) => s.signOut);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const goIn = () => {
    toast.success(t.verify.verified);
    router.replace('/');
  };

  // Automático: en cuanto abres el enlace del correo y vuelves, la app avanza sola.
  useVerificationPoll(goIn);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const check = async () => {
    setBusy(true);
    const ok = await refreshVerification().catch(() => false);
    setBusy(false);
    if (ok) goIn();
    else Alert.alert(t.verify.notYetTitle, t.verify.notYetBody);
  };

  const resend = () =>
    resendVerification()
      .then(() => {
        setCooldown(RESEND_COOLDOWN);
        toast.success(t.verify.resent);
      })
      .catch(() => toast.error(t.errors.generic));

  return (
    <View style={[styles.screen, { backgroundColor: c.background, paddingTop: insets.top + 80, paddingBottom: insets.bottom + space.xl }]}>
      <FloatingMail />
      <Animated.View entering={FadeInDown.springify().damping(18)} style={{ gap: space.md }}>
        <Txt variant="largeTitle">{t.verify.title}</Txt>
        <Txt variant="body" color={c.secondary}>
          {t.verify.body(email ?? '')}
        </Txt>
        <View style={styles.waiting}>
          <ActivityIndicator color={c.tint} />
          <Txt variant="subhead" color={c.secondary}>
            {t.verify.waiting}
          </Txt>
        </View>
      </Animated.View>
      <View style={{ gap: space.md, marginTop: space.lg }}>
        <Button title={t.verify.check} onPress={check} loading={busy} />
        <Button title={cooldown > 0 ? t.verify.resendIn(cooldown) : t.verify.resend} variant="secondary" onPress={resend} disabled={cooldown > 0} />
        <Button
          title={t.verify.otherAccount}
          variant="plain"
          onPress={async () => {
            await signOut();
            router.replace('/login');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: space.xl, gap: space.lg },
  waiting: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs },
});
