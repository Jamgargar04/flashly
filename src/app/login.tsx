import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Field, Txt } from '@/components/ui';
import { space, usePalette } from '@/constants/theme';
import { appInfo } from '@/application/app-info';
import { useSession } from '@/application/session-store';
import { messageOf } from '@/domain/domain-error';
import { INSTITUTION_DOMAIN, isTeacherEmail } from '@/domain/student';

export default function Login() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const signIn = useSession((s) => s.signIn);
  const signUp = useSession((s) => s.signUp);
  const student = useSession((s) => s.student);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const signup = mode === 'signup';
  const isTeacher = isTeacherEmail(email);

  // Navega cuando la sesión realmente existe (Firebase la confirma de forma asíncrona).
  useEffect(() => {
    if (student) router.replace('/');
  }, [student]);

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      if (signup) await signUp({ name, email, password, group });
      else await signIn({ email, password });
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.xxxl, paddingBottom: insets.bottom + space.xxl, paddingHorizontal: space.xl, gap: space.xl }}
        keyboardShouldPersistTaps="handled">
        <Image source={require('@/assets/images/app-icon-small.png')} style={styles.icon} />
        <View style={{ gap: space.sm }}>
          <Txt variant="largeTitle">{signup ? 'Crea tu cuenta' : 'Entra a Flashly'}</Txt>
          <Txt variant="body" color={c.secondary}>
            {signup ? 'Para alumnos y maestros de la UTSV, con tu correo institucional.' : 'Usa tu correo institucional para continuar.'}
          </Txt>
        </View>

        {appInfo.mode === 'demo' ? (
          <Card style={{ gap: 4 }}>
            <Txt variant="headline">Modo demostración</Txt>
            <Txt variant="footnote" color={c.secondary}>
              Esta versión guarda tus datos solo en este teléfono. Conecta Firebase para usar cuentas reales.
            </Txt>
          </Card>
        ) : null}

        <View style={{ gap: space.lg }}>
          {signup ? (
            <>
              <Field label="Nombre completo" value={name} onChangeText={setName} placeholder="Ana Ruiz" autoComplete="name" textContentType="name" />
              {!isTeacher ? (
                <Field label="Grupo y carrera" value={group} onChangeText={setGroup} placeholder="10-A · Software" />
              ) : null}
            </>
          ) : null}
          <Field
            label="Correo institucional"
            value={email}
            onChangeText={setEmail}
            placeholder={`matricula@${INSTITUTION_DOMAIN}`}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            error={!!error}
          />
          <Field
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
            autoComplete={signup ? 'new-password' : 'current-password'}
            textContentType={signup ? 'newPassword' : 'password'}
            error={!!error}
          />
          {error ? (
            <Txt variant="footnote" color={c.danger}>
              {error}
            </Txt>
          ) : null}
        </View>

        <Button title={signup ? 'Crear cuenta' : 'Entrar'} onPress={submit} loading={busy} disabled={!email || !password} />

        <Pressable
          onPress={() => {
            setMode(signup ? 'signin' : 'signup');
            setError('');
          }}
          accessibilityRole="button"
          style={{ alignSelf: 'center', padding: space.sm }}>
          <Txt variant="callout" color={c.tint}>
            {signup ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
          </Txt>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  icon: { width: 72, height: 72 },
});
