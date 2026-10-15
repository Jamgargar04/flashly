import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';

import { useLang } from '@/application/use-lang';
import { brand, radius, space, usePalette } from '@/constants/theme';
import { CHAT_MAX } from '@/domain/chat-message';

import { PressableScale, Txt, useTypeStyle } from './ui';

type ChatComposerProps = { value: string; onChange: (text: string) => void; onSend: () => void; bottomInset: number };

/** Barra para escribir: crece con el texto y el botón de enviar aparece con un rebote. */
export const ChatComposer = ({ value, onChange, onSend, bottomInset }: ChatComposerProps) => {
  const c = usePalette();
  const { t } = useLang();
  const typeStyle = useTypeStyle('callout');
  const hasText = value.trim().length > 0;
  const left = CHAT_MAX - value.length;

  return (
    <View style={[styles.bar, { paddingBottom: bottomInset + space.sm, borderTopColor: c.separator, backgroundColor: c.background }]}>
      <View style={[styles.field, { backgroundColor: c.fill }]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={t.chat.placeholder}
          placeholderTextColor={c.tertiary}
          selectionColor={c.tint}
          maxLength={CHAT_MAX}
          multiline
          accessibilityLabel={t.chat.placeholder}
          style={[typeStyle, styles.input, { color: c.label }]}
        />
        {left <= 40 ? (
          <Txt variant="caption" color={left <= 10 ? c.danger : c.tertiary} style={styles.counter}>
            {String(left)}
          </Txt>
        ) : null}
      </View>
      {hasText ? (
        <Animated.View entering={ZoomIn.springify().damping(14)} exiting={ZoomOut.duration(120)}>
          <PressableScale onPress={onSend} haptic="light" scaleTo={0.88} accessibilityLabel={t.chat.send}>
            <LinearGradient colors={[brand.violet, brand.magenta]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.send}>
              <ArrowUp size={20} color="#FFFFFF" strokeWidth={2.6} />
            </LinearGradient>
          </PressableScale>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.sm, borderTopWidth: StyleSheet.hairlineWidth },
  field: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', minHeight: 40, borderRadius: radius.xl, borderCurve: 'continuous', paddingHorizontal: space.lg },
  input: { flex: 1, maxHeight: 120, paddingTop: 9, paddingBottom: 9 },
  counter: { marginLeft: space.sm, marginBottom: 11 },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
