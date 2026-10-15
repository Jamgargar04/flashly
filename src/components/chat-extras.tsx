import { MessageCircle } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { useLang } from '@/application/use-lang';
import { space, usePalette } from '@/constants/theme';

import { ChoiceChip, EmptyState, Txt } from './ui';

/** "En vivo" con un punto verde que late suavemente. */
export const LiveSubtitle = () => {
  const c = usePalette();
  const { t } = useLang();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={styles.live}>
      <Animated.View style={[styles.dot, { backgroundColor: c.success }, dotStyle]} />
      <Txt variant="caption" color={c.secondary}>
        {t.chat.live}
      </Txt>
    </View>
  );
};

/** Chat vacío: explica quién lo lee y ofrece frases para empezar con un toque. */
export const ChatEmpty = ({ onPick }: { onPick: (text: string) => void }) => {
  const { t } = useLang();
  return (
    <View style={styles.empty}>
      <EmptyState bare icon={<MessageCircle size={24} color="#FFFFFF" />} title={t.chat.emptyTitle} body={t.chat.emptyBody} />
      <View style={styles.suggestions}>
        {t.chat.suggestions.map((suggestion) => (
          <ChoiceChip key={suggestion} label={suggestion} selected={false} onPress={() => onPick(suggestion)} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  live: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  empty: { flex: 1, justifyContent: 'center' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.xl },
});
