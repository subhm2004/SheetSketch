'use client';

import { useEffect, useRef, useState } from 'react';
import { useOthers, useSelf } from '@/lib/liveblocks';
import { participantColor, participantName } from '@/lib/presence-utils';
import { Viewport } from '@/lib/types';
import { canvasToScreen } from '@/lib/canvas-utils';

type Props = {
  viewport: Viewport;
  width: number;
  height: number;
  /** true = everyone's cursors; false = only your own cursor */
  showOthers: boolean;
};

type CursorUser = {
  id: string;
  cursor: { x: number; y: number };
  name: string;
  color: string;
  isMe?: boolean;
};

/** Pointer tip in the 22×22 SVG (viewBox 0 0 24 24, tip ≈ 5.5, 3.5). */
const CURSOR_HOTSPOT_X = 5;
const CURSOR_HOTSPOT_Y = 3;

function screenCursorPosition(screenX: number, screenY: number) {
  return {
    x: screenX - CURSOR_HOTSPOT_X,
    y: screenY - CURSOR_HOTSPOT_Y,
  };
}

function AnimatedCursor({
  targetX,
  targetY,
  name,
  color,
  isMe = false,
}: {
  targetX: number;
  targetY: number;
  name: string;
  color: string;
  isMe?: boolean;
}) {
  const pos = useRef({ x: targetX, y: targetY });
  const [, tick] = useState(0);

  useEffect(() => {
    if (isMe) {
      pos.current.x = targetX;
      pos.current.y = targetY;
      tick((n) => n + 1);
      return;
    }

    let raf = 0;
    const animate = () => {
      const dx = targetX - pos.current.x;
      const dy = targetY - pos.current.y;
      if (Math.abs(dx) > 150 || Math.abs(dy) > 150) {
        pos.current.x = targetX;
        pos.current.y = targetY;
        tick((n) => n + 1);
      } else if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
        pos.current.x += dx * 0.65;
        pos.current.y += dy * 0.65;
        tick((n) => n + 1);
      } else {
        pos.current.x = targetX;
        pos.current.y = targetY;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [targetX, targetY, isMe]);

  return (
    <div
      className={`live-cursor${isMe ? ' live-cursor--self' : ''}`}
      style={{ transform: `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)` }}
    >
      <svg
        className="live-cursor-pointer"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M5.5 3.5L19 16.5L12.5 14.5L9.5 21.5L5.5 3.5Z"
          fill={color}
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="live-cursor-name" style={{ backgroundColor: color }} title={name}>
        {name}
      </span>
    </div>
  );
}

export default function LiveCursors({ viewport, width, height, showOthers }: Props) {
  const me = useSelf();

  const othersCursors = useOthers((others) => {
    const byUser = new Map<string, CursorUser>();
    for (const other of others) {
      if (other.id === me?.id) continue;
      const cursor = other.presence.cursor;
      if (!cursor) continue;
      byUser.set(other.id, {
        id: other.id,
        cursor,
        name: participantName(other),
        color: participantColor(other),
      });
    }
    return [...byUser.values()];
  });

  const selfCursor: CursorUser | null =
    me?.presence.cursor != null
      ? {
          id: me.id,
          cursor: me.presence.cursor,
          name: `${participantName(me)} (you)`,
          color: participantColor(me),
          isMe: true,
        }
      : null;

  const cursors = showOthers ? othersCursors : selfCursor ? [selfCursor] : [];

  if (width <= 0 || height <= 0) return null;

  return (
    <div className="live-cursors-layer" style={{ width, height }} aria-hidden>
      {cursors.map((user) => {
        const screen = canvasToScreen(user.cursor.x, user.cursor.y, viewport);
        const { x, y } = screenCursorPosition(screen.x, screen.y);
        return (
          <AnimatedCursor
            key={user.id}
            targetX={x}
            targetY={y}
            name={user.name}
            color={user.color}
            isMe={user.isMe}
          />
        );
      })}
    </div>
  );
}
