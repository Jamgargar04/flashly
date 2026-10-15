import { router } from 'expo-router';
import { Send, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCampusChat } from '@/application/use-campus-chat';
import { Avatar, Txt } from '@/components/ui';
import { timeAgo } from '@/components/time-format';
import { brand, radius, space, type, usePalette } from '@/constants/theme';

export default function CampusChat() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { messages, send, sending, uid } = useCampusChat();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const submit = async () => {
    if (!text.trim() || sending) return;
    const msg = text;
    setText('');
    await send(msg);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + space.sm, borderBottomColor: c.separator, backgroundColor: c.card }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" style={styles.headerBtn}>
          <X size={22} color={c.label} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Txt variant="headline">Chat del campus</Txt>
          <Txt variant="caption" color={c.secondary}>UTSV — en tiempo real</Txt>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        inverted
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: space.lg, gap: space.md }}
        renderItem={({ item: m }) => {
          const mine = m.authorId === uid;
          return (
            <View style={[styles.bubble, mine && styles.bubbleMine]}>
              {!mine && <Avatar name={m.authorName} size={30} />}
              <View style={[styles.bubble_body, { backgroundColor: mine ? brand.violet : c.card }, mine && styles.bubble_body_mine]}>
                {!mine && <Txt variant="caption" color={c.secondary} style={{ marginBottom: 2 }}>{m.authorName}</Txt>}
                <Txt variant="subhead" color={mine ? '#FFFFFF' : c.label}>{m.text}</Txt>
                <Txt variant="caption" color={mine ? 'rgba(255,255,255,0.6)' : c.tertiary} style={{ marginTop: 2, alignSelf: 'flex-end' }}>{timeAgo(m.createdAt)}</Txt>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Txt variant="subhead" color={c.secondary} center>Sé el primero en escribir algo.</Txt>
          </View>
        }
      />

      {/* Input */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + space.sm, borderTopColor: c.separator, backgroundColor: c.card }]}>
        <TextInput
          value={text}
          onChangeText={(v) => setText(v.slice(0, 200))}
          placeholder="Escribe un mensaje…"
          placeholderTextColor={c.tertiary}
          style={[type.body, styles.input, { color: c.label, backgroundColor: c.background }]}
          returnKeyType="send"
          onSubmitEditing={submit}
          multiline={false}
        />
        <Pressable
          onPress={submit}
          disabled={!text.trim() || sending}
          accessibilityRole="button"
          accessibilityLabel="Enviar"
          style={[styles.sendBtn, { backgroundColor: brand.violet, opacity: !text.trim() || sending ? 0.4 : 1 }]}>
          <Send size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingBottom: space.md, borderBottomWidth: StyleSheet.hairlineWidth },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  bubbleMine: { flexDirection: 'row-reverse' },
  bubble_body: { maxWidth: '75%', padding: space.md, borderRadius: radius.lg, borderCurve: 'continuous', gap: 2 },
  bubble_body_mine: { borderBottomRightRadius: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, height: 44, borderRadius: radius.md, paddingHorizontal: space.md },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
