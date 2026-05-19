import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';
import { LiveList, LiveObject } from '@liveblocks/client';
import type { Shape, Presence, ChatMessage } from './types';
import { getOrCreateGuestId } from './guest-id';

const client = createClient({
  authEndpoint: async (room) => {
    const token = typeof window !== 'undefined'
      ? sessionStorage.getItem('room_token')
      : null;

    const res = await fetch('/api/liveblocks-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room,
        token,
        userId: getOrCreateGuestId(),
        userName: sessionStorage.getItem('room_name') ?? 'Anonymous',
        userColor: sessionStorage.getItem('room_color') ?? '#6965db',
      }),
    });

    if (!res.ok) throw new Error('Liveblocks auth failed');
    return res.json();
  },
});

type Storage = {
  shapes: LiveList<LiveObject<Shape>>;
  messages: LiveList<LiveObject<ChatMessage>>;
};

type UserMeta = {
  id: string;
  info: { name: string; color: string };
};

type RoomEvent = { type: 'chat'; userId: string };
type ThreadMetadata = Record<string, never>;

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useOthersMapped,
  useStorage,
  useMutation,
  useHistory,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useStatus,
  useBroadcastEvent,
  useEventListener,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(client);
