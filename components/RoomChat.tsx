'use client';

import { useEffect, useRef, useState } from 'react';
import { LiveList, LiveObject } from '@liveblocks/client';
import { useSelf, useStorage, useMutation, useBroadcastEvent } from '@/lib/liveblocks';
import type { ChatMessage } from '@/lib/types';
import { getOrCreateGuestId } from '@/lib/guest-id';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RoomChat({ open, onClose }: Props) {
  const me = useSelf();
  const myGuestId = getOrCreateGuestId();
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const initMessages = useMutation(({ storage }) => {
    if (!storage.get('messages')) {
      storage.set('messages', new LiveList<LiveObject<ChatMessage>>([]));
    }
  }, []);

  const storageReady = useStorage((root) => root !== null);

  useEffect(() => {
    if (open && storageReady) initMessages();
  }, [open, storageReady, initMessages]);

  const messages =
    useStorage((root) => {
      const list = root.messages;
      if (!list) return [];
      return list.map((m) => ({ ...m }));
    }) ?? [];

  const broadcast = useBroadcastEvent();

  const sendMessage = useMutation(({ storage }, msg: ChatMessage) => {
    let list = storage.get('messages');
    if (!list) {
      list = new LiveList<LiveObject<ChatMessage>>([]);
      storage.set('messages', list);
    }
    list.push(new LiveObject(msg));
    while (list.length > 200) list.delete(0);
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length, open]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !me) return;

    const userId = myGuestId || String(me.id);
    sendMessage({
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: trimmed,
      userId,
      userName: me.presence.name,
      userColor: me.presence.color,
      createdAt: Date.now(),
    });
    broadcast({ type: 'chat', userId });
    setText('');
  };

  if (!open) return null;

  return (
    <aside className="room-chat" aria-label="Room chat">
      <header className="room-chat-header">
        <h2>Chat</h2>
        <button type="button" className="room-chat-close" onClick={onClose} aria-label="Close chat">
          ×
        </button>
      </header>

      <div ref={listRef} className="room-chat-messages">
        {messages.length === 0 ? (
          <p className="room-chat-empty">Say hello to everyone in the room!</p>
        ) : (
          messages.map((msg) => {
            const isMe =
              (myGuestId && msg.userId === myGuestId) ||
              (me != null && String(me.id) === msg.userId);
            return (
              <div
                key={msg.id}
                className={`chat-bubble ${isMe ? 'chat-bubble--me' : ''}`}
              >
                <span className="chat-bubble-name" style={{ color: msg.userColor }}>
                  {isMe ? 'You' : msg.userName}
                </span>
                <p className="chat-bubble-text">{msg.text}</p>
                <time className="chat-bubble-time">{formatTime(msg.createdAt)}</time>
              </div>
            );
          })
        )}
      </div>

      <form className="room-chat-form" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          autoComplete="off"
          style={{
            color: '#1b1b2e',
            backgroundColor: '#ffffff',
            WebkitTextFillColor: '#1b1b2e',
            caretColor: '#1b1b2e',
          }}
        />
        <button type="submit" disabled={!text.trim()}>
          Send
        </button>
      </form>
    </aside>
  );
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
