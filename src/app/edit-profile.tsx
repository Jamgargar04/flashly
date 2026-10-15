import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/application/session-store';
import { toast } from '@/application/toast-store';
import { useLang } from '@/application/use-lang';
import { useErrorText } from '@/components/localize-error';
import { Avatar, Button, Field, SheetHeader } from '@/components/ui';
import { space, usePalette } from '@/constants/theme';
import { isTeacherEmail, PROFILE_LIMITS } from '@/domain/student';

export default function EditProfile() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const errorText = useErrorText();
  const student = useSession((s) => s.student);
  const updateProfile = useSession((s) => s.updateProfile);
  const [name, setName] = useState(student?.name ?? '');
  const [group, setGroup] = useState(student?.group ?? '');
  const [bio, setBio] = useState(student?.bio ?? '');
  const [busy, setBusy] = useState(false);
  const isTeacher = isTeacherEmail(student?.email ?? '');
  const valid = name.trim().length >= 3;

  const save = async () => {
    setBusy(true);
    try {
      await updateProfile({ name: name.trim(), bio: bio.trim(), group: isTeacher ? undefined : group.trim() });
      toast.success(t.editProfile.saved);
      router.back();
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.background }} behavior="padding">
      <SheetHeader
        title={t.editProfile.title}
        onClose={() => router.back()}
        closeLabel={t.common.cancel}
        right={<Button title={t.common.save} variant="plain" compact onPress={save} disabled={!valid || busy} />}
      />
      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xl, paddingBottom: insets.bottom + space.xxl }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center' }}>
          <Avatar name={name || student?.name || ''} uri={student?.photoUrl} size={84} ring />
        </View>
        <Field
          label={t.editProfile.name}
          value={name}
          onChangeText={setName}
          placeholder={t.editProfile.namePlaceholder}
          maxLength={PROFILE_LIMITS.name}
          autoComplete="name"
          textContentType="name"
          error={name.length > 0 && !valid}
        />
        {!isTeacher ? (
          <Field label={t.editProfile.group} value={group} onChangeText={setGroup} placeholder={t.editProfile.groupPlaceholder} maxLength={PROFILE_LIMITS.group} />
        ) : null}
        <Field
          label={`${t.editProfile.bio} · ${t.common.optional}`}
          value={bio}
          onChangeText={setBio}
          placeholder={t.editProfile.bioPlaceholder}
          maxLength={PROFILE_LIMITS.bio}
          multiline
        />
        <Button title={t.common.save} onPress={save} loading={busy} disabled={!valid} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
