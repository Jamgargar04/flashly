import { router } from 'expo-router';
import { Camera, Pencil } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useDirectory } from '@/application/directory-store';
import { useFeed } from '@/application/feed-store';
import { pickImage } from '@/application/pick-image';
import { toast } from '@/application/toast-store';
import { useLang } from '@/application/use-lang';
import { useChangeAvatar } from '@/application/use-publishing';
import { radius, space, usePalette } from '@/constants/theme';
import { isTeacherEmail, type Student } from '@/domain/student';

import { useErrorText } from '../localize-error';
import { Avatar, Button, Card, Chip, PressableScale, Txt } from '../ui';

/** Contador de la tarjeta de perfil (Siguiendo, Seguidores, Hoy). */
const Stat = ({ value, label }: { value: string; label: string }) => {
  const c = usePalette();
  return (
    <View style={styles.stat}>
      <Txt variant="title2">{value}</Txt>
      <Txt variant="caption" color={c.secondary}>
        {label}
      </Txt>
    </View>
  );
};

/** Foto con botón de cámara: toca para elegir una nueva de la galería y se sube sola. */
const AvatarPicker = ({ student }: { student: Student }) => {
  const c = usePalette();
  const { t } = useLang();
  const errorText = useErrorText();
  const changeAvatar = useChangeAvatar();
  const [uploading, setUploading] = useState(false);

  const choose = async () => {
    const uri = await pickImage({ aspect: [1, 1], circular: true }).catch(() => null);
    if (!uri) return;
    setUploading(true);
    try {
      await changeAvatar(student.uid, uri);
      toast.success(t.profile.photoUpdated);
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <PressableScale onPress={choose} disabled={uploading} haptic="light" accessibilityLabel={t.profile.changePhoto}>
      <Avatar name={student.name} uri={student.photoUrl} size={92} ring />
      <View style={[styles.cameraBadge, { backgroundColor: c.tint, borderColor: c.card }]}>
        <Camera size={15} color="#FFFFFF" />
      </View>
      {uploading ? (
        <View style={styles.uploading} accessibilityLabel={t.profile.uploadingPhoto}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : null}
    </PressableScale>
  );
};

/** Tarjeta principal del perfil: foto, datos y contadores en vivo. */
export const ProfileCard = ({ student }: { student: Student }) => {
  const c = usePalette();
  const { t } = useLang();
  const following = useDirectory((s) => s.following.length);
  const followers = useDirectory((s) => s.followers);
  const postedToday = useFeed((s) => s.own !== null);
  const teacher = isTeacherEmail(student.email);

  return (
    <Card style={styles.card}>
      <AvatarPicker student={student} />
      <View style={styles.identity}>
        <Txt variant="title2" center>
          {student.name || t.profile.noName}
        </Txt>
        <Txt variant="footnote" color={c.secondary} center>
          {student.email}
        </Txt>
      </View>
      {teacher ? <Chip label={t.profile.teacher} color={c.tintFill} textColor={c.tint} /> : student.group ? <Chip label={student.group} /> : null}
      {student.bio ? (
        <Txt variant="subhead" color={c.secondary} center>
          {student.bio}
        </Txt>
      ) : null}
      <Button
        title={t.profile.edit}
        variant="secondary"
        compact
        icon={<Pencil size={16} color={c.tint} />}
        onPress={() => router.push('/edit-profile')}
        style={styles.edit}
      />
      <View style={[styles.stats, { borderTopColor: c.separator }]}>
        <Stat value={String(following)} label={t.profile.following} />
        <View style={[styles.divider, { backgroundColor: c.separator }]} />
        <Stat value={String(followers)} label={t.profile.followers} />
        <View style={[styles.divider, { backgroundColor: c.separator }]} />
        <Stat value={postedToday ? '✓' : '—'} label={t.profile.today} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: space.md, paddingTop: space.xxl },
  identity: { alignItems: 'center', gap: 2 },
  cameraBadge: {
    position: 'absolute', right: 0, bottom: 0, width: 30, height: 30, borderRadius: 15, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  uploading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  edit: { alignSelf: 'stretch' },
  stats: { flexDirection: 'row', alignSelf: 'stretch', borderTopWidth: StyleSheet.hairlineWidth, marginTop: space.sm, paddingTop: space.lg },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  divider: { width: StyleSheet.hairlineWidth },
});
