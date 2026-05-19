'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelf, useStorage, useEventListener } from '@/lib/liveblocks';
import { getOrCreateGuestId } from '@/lib/guest-id';

function isOwnUserId(
  userId: string,
  myGuestId: string,
  myLiveblocksId: string | undefined,
): boolean {
  if (myGuestId && userId === myGuestId) return true;
  if (myLiveblocksId != null && userId === myLiveblocksId) return true;
  return false;
}

export function useChatUnread(chatOpen: boolean) {
  const me = useSelf();
  const myGuestId = getOrCreateGuestId();
  const myLiveblocksId = me?.id != null ? String(me.id) : undefined;
  const [hasUnread, setHasUnread] = useState(false);
  const readCountRef = useRef(0);
  const readyRef = useRef(false);
  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;

  const messageCount = useStorage((root) => {
    if (!root) return null;
    return root.messages?.length ?? 0;
  });

  const messageUserIds = useStorage((root) => {
    if (!root?.messages) return null;
    return root.messages.map((m) => m.userId).join('\n');
  });

  const markRead = useCallback(() => {
    if (messageCount !== null) readCountRef.current = messageCount;
    setHasUnread(false);
  }, [messageCount]);

  const flagUnreadFromUser = useCallback(
    (userId: string) => {
      if (chatOpenRef.current) return;
      if (isOwnUserId(userId, myGuestId, myLiveblocksId)) return;
      setHasUnread(true);
    },
    [myGuestId, myLiveblocksId],
  );

  useEventListener(({ event }) => {
    if (event.type === 'chat') flagUnreadFromUser(event.userId);
  });

  useEffect(() => {
    if (messageCount === null || messageUserIds === null) return;

    if (!readyRef.current) {
      readyRef.current = true;
      readCountRef.current = messageCount;
      return;
    }

    if (chatOpen) {
      markRead();
      return;
    }

    if (messageCount <= readCountRef.current) return;

    const newUserIds = messageUserIds.split('\n').slice(readCountRef.current);
    if (newUserIds.some((id) => !isOwnUserId(id, myGuestId, myLiveblocksId))) {
      setHasUnread(true);
    }
  }, [messageCount, messageUserIds, chatOpen, myGuestId, myLiveblocksId, markRead]);

  return hasUnread;
}
