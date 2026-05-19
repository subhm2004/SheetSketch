'use client';

import { useState } from 'react';

type Props = { roomId: string };

export default function InviteButton({ roomId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');

  const handleCopy = async () => {
    const token = sessionStorage.getItem('room_token');
    if (!token) return;

    setStatus('loading');
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/invite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        return;
      }

      await navigator.clipboard.writeText(data.inviteUrl);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  const label =
    status === 'loading'
      ? '…'
      : status === 'copied'
        ? 'Copied!'
        : status === 'error'
          ? 'Failed'
          : 'Invite';

  return (
    <button
      type="button"
      className="header-action-btn invite-btn"
      onClick={handleCopy}
      disabled={status === 'loading'}
      title="Copy invite link — recipient will need the room password"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      <span className="btn-label">{label}</span>
    </button>
  );
}
