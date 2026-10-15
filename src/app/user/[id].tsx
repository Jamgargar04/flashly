import { router, useLocalSearchParams } from 'expo-router';
import { Clock, Lock, UserX } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDirectory, useFollowerCount } from '@/application/directory-store';
import { useFeed } from '@/application/feed-store';
import { useSession } from '@/application/session-store';
import { toast } from '@/application/toast-store';
import { useLang } from '@/application/use-lang';
import { useErrorText } from '@/components/localize-error';
import { MomentList } from '@/components/moment-list';
import { FollowButton } from '@/components/person-card';
import { Avatar, Card, Chip, EmptyState, SheetHeader, Txt } from '@/components/ui';
import { space, usePalette } from '@/constants/theme';

/** Su momento de hoy: visible solo si tú ya publicaste. */
const TodayMoment = ({ personId }: { personId: string }) => {
  const c = usePalette();
  const { t } = useLang();
  const locked = useFeed((s) => s.own === null);
  const moment = useFeed((s) => s.moments.find((item) => item.authorId === personId));

  if (locked) {
    return (
      <Card style={styles.note}>
        <Lock size={18} color={c.secondary} />
        <Txt variant="subhead" color={c.secondary} style={{ flex: 1 }}>
          {t.today.lockedBody}
        </Txt>
      </Card>
    );
  }
  if (!moment) {
    return (
      <Card style={styles.note}>
        <Clock size={18} color={c.secondary} />
        <Txt variant="subhead" color={c.secondary} style={{ flex: 1 }}>
          {t.person.notPosted}
        </Txt>
      </Card>
    );
  }
  return <MomentList moments={[moment]} />;
};

/** Ficha de otra persona: foto, grupo, seguidores en vivo, seguir y su momento de hoy. */
export default function PersonProfile() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const errorText = useErrorText();
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = useSession((s) => s.student?.uid ?? '');
  const person = useDirectory((s) => s.people.find((item) => item.id === id));
  const following = useDirectory((s) => s.following.includes(id));
  const followers = useFollowerCount(id);

  const toggle = () => useDirectory.getState().toggleFollow(uid, id).catch((error: unknown) => toast.error(errorText(error)));

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SheetHeader title={person?.name ?? ''} onClose={() => router.back()} closeLabel={t.common.close} />
      {!person ? (
        <EmptyState bare icon={<UserX size={24} color="#FFFFFF" />} title={t.person.notFound} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xl, paddingBottom: insets.bottom + space.xxl }}>
          <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
            <Avatar name={person.name} uri={person.photoUrl} source={person.avatar} size={104} ring />
            <Txt variant="title1" center>
              {person.name}
            </Txt>
            {person.group ? <Chip label={person.group} /> : null}
            {person.bio ? (
              <Txt variant="subhead" color={c.secondary} center>
                {person.bio}
              </Txt>
            ) : null}
            <Txt variant="subhead" color={c.secondary}>
              {t.person.followers(followers)}
            </Txt>
            {id !== uid ? <FollowButton following={following} onPress={toggle} wide /> : null}
          </Animated.View>
          <View style={{ gap: space.md }}>
            <Txt variant="title2">{t.profile.today}</Txt>
            <TodayMoment personId={id} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: space.sm },
  note: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
