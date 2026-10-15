import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appInfo } from '@/application/app-info';
import { useSession } from '@/application/session-store';
import { useLang } from '@/application/use-lang';
import { ProfileCard } from '@/components/profile/profile-card';
import { AccountGroup, AppearanceGroup, NotificationsGroup } from '@/components/profile/settings-groups';
import { LargeHeader, Txt } from '@/components/ui';
import { space, usePalette } from '@/constants/theme';

export default function Profile() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const student = useSession((s) => s.student);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 120 }}>
      <LargeHeader title={t.profile.header} />
      <View style={{ paddingHorizontal: space.xl, gap: space.xxl }}>
        {student ? <ProfileCard student={student} /> : null}
        <AppearanceGroup />
        <NotificationsGroup />
        <AccountGroup />
        <Txt variant="footnote" color={c.tertiary} center>
          {t.profile.version(appInfo.version)}
        </Txt>
      </View>
    </ScrollView>
  );
}
