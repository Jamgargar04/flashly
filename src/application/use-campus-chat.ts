import { useCallback, useEffect, useRef, useState } from 'react';

import type { ChatMessage } from '@/domain/chat-message';
import { services } from '@/infrastructure/container';
import { useSession } from './session-store';

export const useCampusChat = () => {
  const student = useSession((s) => s.student);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const unsub = services.chat.subscribe((msgs) => {
      if (mounted.current) setMessages(msgs);
    });
    return () => {
      mounted.current = false;
      unsub();
    };
  }, []);

  const send = useCallback(
    async (text: string) => {
      if (!student || !text.trim()) return;
      setSending(true);
      try {
        await services.chat.send(student.uid, student.name, text.trim());
      } finally {
        if (mounted.current) setSending(false);
      }
    },
    [student],
  );

  return { messages, send, sending, uid: student?.uid ?? '' };
};
