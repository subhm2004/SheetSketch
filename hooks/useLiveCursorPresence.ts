import { useCallback, useEffect, useRef } from 'react';
import { useUpdateMyPresence } from '@/lib/liveblocks';
import { screenToCanvas } from '@/lib/canvas-utils';
import type { Viewport } from '@/lib/types';

type Options = {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  viewport: Viewport;
};

function readIdentity() {
  return {
    name: sessionStorage.getItem('room_name')?.trim() || 'Anonymous',
    color: sessionStorage.getItem('room_color')?.trim() || '#6965db',
  };
}

export function useLiveCursorPresence({ wrapperRef, viewport }: Options) {
  const updateMyPresence = useUpdateMyPresence();
  const viewportRef = useRef(viewport);
  const wasInsideRef = useRef(false);

  viewportRef.current = viewport;

  useEffect(() => {
    updateMyPresence(readIdentity());
  }, [updateMyPresence]);

  const broadcastCursor = useCallback(
    (pos: { x: number; y: number } | null) => {
      updateMyPresence({ cursor: pos, ...readIdentity() });
    },
    [updateMyPresence],
  );

  useEffect(() => {
    let lastSent = 0;

    const track = (clientX: number, clientY: number) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const inside =
        sx >= 0 && sy >= 0 && sx <= rect.width && sy <= rect.height;

      if (!inside) {
        if (wasInsideRef.current) {
          wasInsideRef.current = false;
          broadcastCursor(null);
        }
        return;
      }

      const now = performance.now();
      if (now - lastSent < 16) return;
      lastSent = now;

      wasInsideRef.current = true;
      const { x, y } = screenToCanvas(sx, sy, viewportRef.current);
      broadcastCursor({ x, y });
    };

    const onPointerMove = (e: PointerEvent) => track(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => track(e.clientX, e.clientY);

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [wrapperRef, broadcastCursor]);

  return {};
}
