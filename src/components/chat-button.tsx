import { router } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import React from 'react';

import { useUnreadChat } from '@/application/chat-store';
import { useSession } from '@/application/session-store';
import { useLang } from '@/application/use-lang';
import { usePalette } from '@/constants/theme';

import { IconButton } from './ui';

/** Acceso al chat del campus con el contador de mensajes sin leer (como los mensajes de Instagram). */
export const ChatButton = () => {
  const c = usePalette();
  const { t } = useLang();
  const uid = useSession((s) => s.student?.uid ?? '');
  const unread = useUnreadChat(uid);
  return (
    <IconButton
      icon={<MessageCircle size={21} color={c.tint} />}
      label={unread > 0 ? `${t.today.chat} (${unread})` : t.today.chat}
      variant="tint"
      badge={unread}
      onPress={() => router.push('/campus-chat')}
    />
  );
};
