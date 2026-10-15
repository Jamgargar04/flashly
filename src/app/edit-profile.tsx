import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/application/session-store';
import { Button, Field, Txt } from '@/components/ui';
import { space, usePalette } from '@/constants/theme';
import { messageOf } from '@/domain/domain-error';
import { isTeacherEmail } from '@/domain/student';

export default function EditProfile() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const student = useSession((s) => s.student);
  const updateProfile = useSession((s) => s.updateProfile);

  const [name, setName] = useState(student?.name ?? '');
  const [group, setGroup] = useState(student?.group ?? '');
  const [bio, setBio] = useState(student?.bio ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isTeacher = isTeacherEmail(student?.email ?? '');

  const save = async () => {
    if (!name.trim()) { setError('Escribe tu nombre.'); return; }
    setError('');
    setBusy(true);
    try {
      await updateProfile({ name: name.trim(), bio: bio.trim() || undefined, group: isTeacher ? undefined : group.trim() });
      router.back();
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xxl, paddingHorizontal: space.xl, gap: space.xl }}
        keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Txt variant="largeTitle">Editar perfil</Txt>
          <Button title="Cancelar" variant="plain" compact onPress={() => router.back()} />
        </View>

        <View style={{ gap: space.lg }}>
          <Field
            label="Nombre completo"
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            autoComplete="name"
            textContentType="name"
          />
          {!isTeacher ? (
            <Field
              label="Grupo y carrera"
              value={group}
              onChangeText={setGroup}
              placeholder="10-A · Software"
            />
          ) : null}
          <Field
            label="Sobre mí"
            value={bio}
            onChangeText={setBio}
            placeholder="Cuéntanos algo de ti (opcional)"
            maxLength={120}
            multiline
          />
          {error ? (
            <Txt variant="footnote" color={c.danger}>{error}</Txt>
          ) : null}
        </View>

        <Button title="Guardar cambios" onPress={save} loading={busy} disabled={!name.trim()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
