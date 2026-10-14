import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';

import { usePalette } from '@/constants/theme';

export default function TabsLayout() {
  const c = usePalette();
  return (
    <NativeTabs backgroundColor={c.card} indicatorColor={c.fill} labelStyle={{ selected: { color: c.tint } }}>
      <NativeTabs.Trigger name="today">
        <NativeTabs.Trigger.Label>Hoy</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/today.png')} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover">
        <NativeTabs.Trigger.Label>Descubrir</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/discover.png')} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/profile.png')} renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
