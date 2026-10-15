import { LinearGradient } from 'expo-linear-gradient';
import { Clock3 } from 'lucide-react-native';
import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useLang } from '@/application/use-lang';
import { brand, radius, space, usePalette } from '@/constants/theme';
import type { ChatRow } from '@/domain/chat-message';

import { chatDay, clock } from './time-format';
import { Avatar, Txt } from './ui';

type MessageRow = Extract<ChatRow, { kind: 'message' }>;

type ChatBubbleProps = {
  row: MessageRow;
  failed: boolean;
  /** Recién llegado: entra con animación. Los del historial aparecen sin moverse. */
  fresh: boolean;
  onLongPress: (row: MessageRow) => void;
  onRetry: (row: MessageRow) => void;
};

const SMALL = 6;

/** Burbuja estilo iMessage: agrupa mensajes seguidos, nombre arriba y foto abajo del grupo. */
export const ChatBubble = memo(({ row, failed, fresh, onLongPress, onRetry }: ChatBubbleProps) => {
  const c = usePalette();
  const { t } = useLang();
  const { message, mine, first, last } = row;
  const corners = mine
    ? { borderTopRightRadius: first ? radius.lg : SMALL, borderBottomRightRadius: last ? radius.lg : SMALL }
    : { borderTopLeftRadius: first ? radius.lg : SMALL, borderBottomLeftRadius: last ? radius.lg : SMALL };

  const text = (
    <Txt variant="callout" color={mine ? '#FFFFFF' : c.label} selectable>
      {message.text}
    </Txt>
  );

  return (
    <Animated.View entering={fresh ? FadeInDown.springify().damping(18) : undefined} style={[styles.container, { marginTop: first ? space.sm : 2 }]}>
      {!mine && first ? (
        <Txt variant="caption" color={c.secondary} style={styles.name} numberOfLines={1}>
          {message.authorName}
        </Txt>
      ) : null}
      {/* La foto se alinea con la última burbuja del grupo, como en iMessage. */}
      <View style={[styles.row, mine && styles.rowMine]}>
        {!mine ? <View style={styles.avatarSlot}>{last ? <Avatar name={message.authorName} uri={message.authorPhoto} size={AVATAR} /> : null}</View> : null}
        <Pressable
          onLongPress={() => onLongPress(row)}
          onPress={failed ? () => onRetry(row) : undefined}
          delayLongPress={300}
          accessibilityRole="text"
          accessibilityLabel={`${message.authorName}: ${message.text}`}
          style={({ pressed }) => [styles.column, { opacity: pressed || message.pending || failed ? 0.6 : 1 }]}>
          {mine ? (
            <LinearGradient colors={[brand.violet, brand.magenta]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bubble, corners]}>
              {text}
            </LinearGradient>
          ) : (
            <View style={[styles.bubble, corners, { backgroundColor: c.bubble }]}>{text}</View>
          )}
        </Pressable>
      </View>
      {last || failed ? (
        <View style={[styles.meta, mine ? styles.metaMine : styles.metaTheirs]}>
          {message.pending ? <Clock3 size={11} color={c.tertiary} /> : null}
          <Txt variant="caption" color={failed ? c.danger : c.tertiary}>
            {failed ? t.chat.failed : clock(message.createdAt)}
          </Txt>
        </View>
      ) : null}
    </Animated.View>
  );
});

ChatBubble.displayName = 'ChatBubble';

/** Separador de día: "Hoy", "Ayer" o la fecha. */
export const DaySeparator = ({ at }: { at: number }) => {
  const c = usePalette();
  const { t } = useLang();
  return (
    <View style={styles.day}>
      <Txt variant="caption" color={c.secondary}>
        {chatDay(t.time, at)}
      </Txt>
    </View>
  );
};

const AVATAR = 28;

const styles = StyleSheet.create({
  container: { paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  rowMine: { justifyContent: 'flex-end' },
  avatarSlot: { width: AVATAR },
  column: { maxWidth: '78%' },
  name: { marginLeft: AVATAR + space.sm + space.md, marginBottom: 2 },
  bubble: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.lg, borderCurve: 'continuous' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  metaMine: { alignSelf: 'flex-end', marginRight: 6 },
  metaTheirs: { marginLeft: AVATAR + space.sm + 6 },
  day: { alignItems: 'center', paddingVertical: space.md },
});
