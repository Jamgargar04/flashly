import * as Haptics from 'expo-haptics';
import { CircleAlert, CircleCheck, Info } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';

import { useToast } from '@/application/toast-store';
import { elevation, radius, space, usePalette } from '@/constants/theme';

import { Txt } from './ui';

const VISIBLE_MS = 2600;

/** Aviso flotante: baja desde arriba con un resorte y se va solo. Se descarta con un toque. */
export const ToastHost = () => {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const current = useToast((s) => s.current);
  const hide = useToast((s) => s.hide);

  useEffect(() => {
    if (!current) return;
    const feedback = { success: Haptics.NotificationFeedbackType.Success, error: Haptics.NotificationFeedbackType.Error, info: null }[current.tone];
    if (feedback) Haptics.notificationAsync(feedback).catch(() => undefined);
    const id = setTimeout(() => hide(current.id), VISIBLE_MS);
    return () => clearTimeout(id);
  }, [current, hide]);

  if (!current) return null;
  const Icon = { success: CircleCheck, error: CircleAlert, info: Info }[current.tone];
  const color = { success: c.success, error: c.danger, info: c.tint }[current.tone];

  const toastView = (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + space.sm }]}>
      <Animated.View key={current.id} entering={FadeInUp.springify().damping(18)} exiting={FadeOutUp.duration(180)}>
        <Pressable
          onPress={() => hide(current.id)}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[styles.toast, elevation.floating, { backgroundColor: c.elevated }]}>
          <Icon size={20} color={color} />
          <Txt variant="subhead" style={{ flexShrink: 1 }}>
            {current.message}
          </Txt>
        </Pressable>
      </Animated.View>
    </View>
  );
  // En iOS las pantallas modales van en otra ventana: el aviso necesita su propia capa para verse encima.
  return Platform.OS === 'ios' ? <FullWindowOverlay>{toastView}</FullWindowOverlay> : toastView;
};

const styles = StyleSheet.create({
  host: { position: 'absolute', left: space.lg, right: space.lg, alignItems: 'center', zIndex: 1000, elevation: 1000 },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md,
    borderRadius: radius.pill, borderCurve: 'continuous', maxWidth: 520,
  },
});
