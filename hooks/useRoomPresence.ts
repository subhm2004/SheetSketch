import { useCallback, useEffect, useRef } from 'react';
import { useUpdateMyPresence } from '@/lib/liveblocks';
import { screenToCanvas } from '@/lib/canvas-utils';
import { appendLaserPoint } from '@/lib/laser-pointer';
import type { PresentationPointer, Viewport } from '@/lib/types';

type Options = {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  viewport: Viewport;
  pointerMode: PresentationPointer;
};

function readIdentity() {
  return {
    name: sessionStorage.getItem('room_name')?.trim() || 'Anonymous',
    color: sessionStorage.getItem('room_color')?.trim() || '#6965db',
  };
}

export function useRoomPresence({ wrapperRef, viewport, pointerMode }: Options) {
  const updateMyPresence = useUpdateMyPresence();
  const viewportRef = useRef(viewport);
  const modeRef = useRef(pointerMode);
  const trailRef = useRef<ReturnType<typeof appendLaserPoint>>([]);
  const wasInsideRef = useRef(false);

  viewportRef.current = viewport;
  modeRef.current = pointerMode;

  useEffect(() => {
    updateMyPresence({ ...readIdentity(), pointerMode, laserTrail: null });
  }, [updateMyPresence, pointerMode]);

  const broadcast = useCallback(
    (cursor: { x: number; y: number } | null, trail: typeof trailRef.current) => {
      updateMyPresence({
        cursor,
        laserTrail: modeRef.current === 'laser' ? trail : null,
        pointerMode: modeRef.current,
        ...readIdentity(),
      });
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
      const inside = sx >= 0 && sy >= 0 && sx <= rect.width && sy <= rect.height;

      if (!inside) {
        if (wasInsideRef.current) {
          wasInsideRef.current = false;
          trailRef.current = [];
          broadcast(null, []);
        }
        return;
      }

      const now = performance.now();
      if (now - lastSent < 16) return;
      lastSent = now;

      wasInsideRef.current = true;
      const { x, y } = screenToCanvas(sx, sy, viewportRef.current);

      if (modeRef.current === 'laser') {
        trailRef.current = appendLaserPoint(trailRef.current, x, y);
        broadcast({ x, y }, trailRef.current);
      } else {
        trailRef.current = [];
        broadcast({ x, y }, []);
      }
    };

    const onPointerMove = (e: PointerEvent) => track(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => track(e.clientX, e.clientY);

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [wrapperRef, broadcast]);
}
