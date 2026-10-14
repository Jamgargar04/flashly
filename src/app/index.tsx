import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useSession } from '@/application/session-store';
import { usePalette } from '@/constants/theme';

/** Decide a qué pantalla entra el usuario según su sesión. */
export default function Gate() {
  const c = usePalette();
  const ready = useSession((s) => s.ready);
  const onboarded = useSession((s) => s.onboarded);
  const student = useSession((s) => s.student);

  if (!ready) return <View style={{ flex: 1, backgroundColor: c.background }} />;
  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!student) return <Redirect href="/login" />;
  if (!student.verified) return <Redirect href="/verify" />;
  return <Redirect href="/today" />;
}
