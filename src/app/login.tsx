import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appInfo } from '@/application/app-info';
import { useSession } from '@/application/session-store';
import { toast } from '@/application/toast-store';
import { useLang } from '@/application/use-lang';
import { useErrorText } from '@/components/localize-error';
import { Button, Card, ChoiceChip, Field, SegmentedControl, Txt } from '@/components/ui';
import { space, usePalette } from '@/constants/theme';
import { completeEmail, isTeacherEmail, PROFILE_LIMITS } from '@/domain/student';

type Mode = 'signin' | 'signup';

/** Con escribir la matrícula aparece el dominio institucional para completarlo con un toque. */
const EmailSuggestions = ({ email, onPick }: { email: string; onPick: (email: string) => void }) => {
  const suggestions = completeEmail(email);
  if (suggestions.length === 0) return null;
  return (
    <Animated.View entering={FadeIn.duration(160)} style={styles.suggestions}>
      {suggestions.map((suggestion) => (
        <ChoiceChip key={suggestion} label={`@${suggestion.split('@')[1]}`} selected={false} onPress={() => onPick(suggestion)} />
      ))}
    </Animated.View>
  );
};

export default function Login() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const errorText = useErrorText();
  const signIn = useSession((s) => s.signIn);
  const signUp = useSession((s) => s.signUp);
  const sendPasswordReset = useSession((s) => s.sendPasswordReset);
  const student = useSession((s) => s.student);
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      if (signup) await signUp({ name, email, password, group: isTeacher ? '' : group });
      else await signIn({ email, password });
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    if (!email.trim()) return toast.info(t.login.resetNeedsEmail);
    try {
      const sentTo = await sendPasswordReset(email);
      toast.success(t.login.resetSent(sentTo));
    } catch (e) {
      setError(errorText(e));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.background }} behavior="padding">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.xxxl, paddingBottom: insets.bottom + space.xxl, paddingHorizontal: space.xl, gap: space.xl }}
        keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.springify().damping(18)}>
          <Image source={require('@/assets/images/app-icon-small.png')} style={styles.icon} />
        </Animated.View>
        <Animated.View key={mode} entering={FadeIn.duration(220)} style={{ gap: space.sm }}>
          <Txt variant="largeTitle">{signup ? t.login.signUpTitle : t.login.signInTitle}</Txt>
          <Txt variant="body" color={c.secondary}>
            {signup ? t.login.signUpSubtitle : t.login.signInSubtitle}
          </Txt>
        </Animated.View>

        <SegmentedControl<Mode>
          options={[
            { value: 'signin', label: t.login.signInTab },
            { value: 'signup', label: t.login.signUpTab },
          ]}
          value={mode}
          onChange={(value) => {
            setMode(value);
            setError('');
          }}
        />

        {appInfo.mode === 'demo' ? (
          <Card style={{ gap: 4 }}>
            <Txt variant="headline">{t.login.demoTitle}</Txt>
            <Txt variant="footnote" color={c.secondary}>
              {t.login.demoBody}
            </Txt>
          </Card>
        ) : null}

        <Animated.View layout={LinearTransition.springify().damping(20)} style={{ gap: space.lg }}>
          {signup ? (
            <Animated.View entering={FadeInDown.duration(220)}>
              <Field label={t.login.name} value={name} onChangeText={setName} placeholder={t.login.namePlaceholder} maxLength={PROFILE_LIMITS.name} autoComplete="name" textContentType="name" />
            </Animated.View>
          ) : null}
          <View style={{ gap: space.sm }}>
            <Field
              label={t.login.email}
              value={email}
              onChangeText={(value) => setEmail(value.replace(/\s/g, ''))}
              placeholder={t.login.emailPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              error={!!error}
              hint={signup && isTeacher ? t.login.teacherHint : undefined}
            />
            <EmailSuggestions email={email} onPick={setEmail} />
          </View>
          {signup && !isTeacher ? (
            <Animated.View entering={FadeInDown.duration(220)}>
              <Field label={t.login.group} value={group} onChangeText={setGroup} placeholder={t.login.groupPlaceholder} maxLength={PROFILE_LIMITS.group} />
            </Animated.View>
          ) : null}
          <Field
            label={t.login.password}
            value={password}
            onChangeText={setPassword}
            placeholder={t.login.passwordPlaceholder}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete={signup ? 'new-password' : 'current-password'}
            textContentType={signup ? 'newPassword' : 'password'}
            onSubmitEditing={submit}
            returnKeyType="go"
            error={error || undefined}
            right={
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10} accessibilityRole="button" accessibilityLabel={showPassword ? t.login.hidePassword : t.login.showPassword}>
                {showPassword ? <EyeOff size={20} color={c.secondary} /> : <Eye size={20} color={c.secondary} />}
              </Pressable>
            }
          />
        </Animated.View>

        <Button title={signup ? t.login.signUpTab : t.login.signInTab} onPress={submit} loading={busy} disabled={!email || password.length < 8} />

        {!signup ? (
          <Pressable onPress={resetPassword} accessibilityRole="button" style={styles.link}>
            <Txt variant="callout" color={c.tint}>
              {t.login.forgot}
            </Txt>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  icon: { width: 72, height: 72 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginLeft: 2 },
  link: { alignSelf: 'center', padding: space.sm },
});
