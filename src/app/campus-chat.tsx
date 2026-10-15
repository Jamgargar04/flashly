import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, type AlertButton } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChat } from '@/application/chat-store';
import { useSession } from '@/application/session-store';
import { toast } from '@/application/toast-store';
import { useLang } from '@/application/use-lang';
import { ChatBubble, DaySeparator } from '@/components/chat-bubble';
import { ChatComposer } from '@/components/chat-composer';
import { ChatEmpty, LiveSubtitle } from '@/components/chat-extras';
import { useErrorText } from '@/components/localize-error';
import { SheetHeader } from '@/components/ui';
import { useKeyboardVisible } from '@/components/use-keyboard-visible';
import { space, usePalette } from '@/constants/theme';
import { buildChatRows, type ChatRow } from '@/domain/chat-message';

type MessageRow = Extract<ChatRow, { kind: 'message' }>;

export default function CampusChat() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const errorText = useErrorText();
  const keyboardVisible = useKeyboardVisible();
  const student = useSession((s) => s.student);
  const messages = useChat((s) => s.messages);
  const failed = useChat((s) => s.failed);
  const loaded = useChat((s) => s.loaded);
  const [text, setText] = useState('');
  const [openedAt] = useState(() => Date.now());

  // Mientras el chat está abierto, lo que llega cuenta como leído (el contador se limpia solo).
  const newestId = messages[0]?.id;
  useFocusEffect(
    useCallback(() => {
      useChat.getState().markSeen();
    }, [newestId]),
  );

  if (!student) return null;

  const rows = buildChatRows([...failed, ...messages].sort((a, b) => b.createdAt - a.createdAt), student.uid);
  const failedIds = new Set(failed.map((message) => message.id));
  const fail = (error: unknown) => toast.error(errorText(error));

  const submit = () => {
    if (!text.trim()) return;
    const value = text;
    setText('');
    void useChat.getState().send(student, value);
  };

  const confirm = (title: string, body: string, action: string, run: () => Promise<void>) =>
    Alert.alert(title, body, [
      { text: t.common.cancel, style: 'cancel' },
      { text: action, style: 'destructive', onPress: () => run().catch(fail) },
    ]);

  const onLongPress = ({ message, mine }: MessageRow) => {
    const remove = () => confirm(t.chat.deleteTitle, t.chat.deleteBody, t.common.delete, () => useChat.getState().remove(message.id).then(() => toast.success(t.chat.deleted)));
    const report = () =>
      confirm(t.chat.reportTitle, t.chat.reportBody, t.common.report, () => useChat.getState().report(message, student.uid).then(() => toast.success(t.chat.reported)));
    if (mine) return remove();
    const buttons: AlertButton[] = [{ text: t.common.cancel, style: 'cancel' }, { text: t.common.report, onPress: report }];
    if (student.isAdmin) buttons.push({ text: t.common.delete, style: 'destructive', onPress: remove });
    Alert.alert(message.authorName, message.text, buttons);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.background }} behavior="padding">
      <SheetHeader variant="back" title={t.chat.title} subtitle={<LiveSubtitle />} onClose={() => router.back()} closeLabel={t.common.close} />
      {!loaded ? (
        <ActivityIndicator style={styles.loading} color={c.tint} />
      ) : rows.length === 0 ? (
        <ChatEmpty onPick={setText} />
      ) : (
        <FlatList
          inverted
          data={rows}
          keyExtractor={(row) => row.key}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          renderItem={({ item }) =>
            item.kind === 'day' ? (
              <DaySeparator at={item.at} />
            ) : (
              <ChatBubble
                row={item}
                failed={failedIds.has(item.message.id)}
                fresh={item.message.createdAt > openedAt}
                onLongPress={onLongPress}
                onRetry={(row) => void useChat.getState().retry(row.message.id, student)}
              />
            )
          }
        />
      )}
      <ChatComposer value={text} onChange={setText} onSend={submit} bottomInset={keyboardVisible ? 0 : insets.bottom} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  list: { paddingVertical: space.md },
});
