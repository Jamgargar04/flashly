import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';

import { useLang } from '@/application/use-lang';
import { usePalette } from '@/constants/theme';

export default function TabsLayout() {
  const c = usePalette();
  const { t } = useLang();
  return (
    <NativeTabs backgroundColor={c.card} indicatorColor={c.tintFill} labelStyle={{ selected: { color: c.tint } }}>
      <NativeTabs.Trigger name="today">
        <NativeTabs.Trigger.Label>{t.tabs.today}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/today.png')} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover">
        <NativeTabs.Trigger.Label>{t.tabs.discover}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/discover.png')} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>{t.tabs.profile}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/profile.png')} renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
