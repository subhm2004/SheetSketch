'use client';

import { useSelf, useOthers, useStatus } from '@/lib/liveblocks';
import { participantColor, participantName, uniqueByUserId } from '@/lib/presence-utils';

export default function Presence() {
  const status = useStatus();
  const me = useSelf();
  const others = useOthers();

  if (status !== 'connected') {
    return (
      <div className="presence-bar">
        <span className="presence-live presence-live--connecting">
          <span className="collab-dot collab-dot--pulse" />
          Connecting…
        </span>
      </div>
    );
  }

  const otherUsers = uniqueByUserId(
    others.map((o) => ({
      id: o.id,
      name: participantName(o),
      color: participantColor(o),
    })),
  ).filter((o) => o.id !== me?.id);

  const allUsers = [
    ...(me
      ? [{ id: me.id, name: participantName(me), color: participantColor(me), isMe: true }]
      : []),
    ...otherUsers.map((o) => ({ ...o, isMe: false })),
  ];

  const totalOnline = allUsers.length;

  return (
    <div className="presence-bar">
      {allUsers.map((u) => (
        <div key={u.id} className="avatar" title={u.name + (u.isMe ? ' (you)' : '')}>
          <div
            className="avatar-circle"
            style={{ background: u.color, outline: u.isMe ? `2px solid ${u.color}` : 'none' }}
          >
            {u.name.slice(0, 1).toUpperCase()}
          </div>
        </div>
      ))}
      <span className="presence-live" title="People in this room">
        <span className="collab-dot" />
        {totalOnline} online
      </span>
    </div>
  );
}
