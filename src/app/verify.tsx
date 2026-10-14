import { router } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Txt } from '@/components/ui';
import { space, usePalette } from '@/constants/theme';
import { useSession } from '@/application/session-store';

export default function Verify() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const email = useSession((s) => s.student?.email);
  const refreshVerification = useSession((s) => s.refreshVerification);
  const resendVerification = useSession((s) => s.resendVerification);
  const signOut = useSession((s) => s.signOut);
  const [busy, setBusy] = useState(false);

  const check = async () => {
    setBusy(true);
    const ok = await refreshVerification().catch(() => false);
    setBusy(false);
    if (ok) router.replace('/today');
    else Alert.alert('Todavía no está verificado', 'Abre el enlace que te enviamos y vuelve a intentarlo.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background, paddingTop: insets.top + 80, paddingHorizontal: space.xl, gap: space.lg }}>
      <MailCheck size={56} color={c.tint} />
      <Txt variant="largeTitle">Revisa tu correo</Txt>
      <Txt variant="body" color={c.secondary}>
        Te enviamos un enlace a {email}. Ábrelo para activar tu cuenta y poder publicar.
      </Txt>
      <View style={{ gap: space.md, marginTop: space.lg }}>
        <Button title="Ya lo verifiqué" onPress={check} loading={busy} />
        <Button
          title="Reenviar correo"
          variant="secondary"
          onPress={() => resendVerification().then(() => Alert.alert('Correo enviado', 'Revisa también la carpeta de spam.')).catch(() => undefined)}
        />
        <Button
          title="Usar otra cuenta"
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
