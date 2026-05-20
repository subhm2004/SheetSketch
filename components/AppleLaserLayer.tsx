'use client';

import { useEffect, useRef } from 'react';
import { useOthers, useSelf } from '@/lib/liveblocks';
import { drawLaserTrail } from '@/lib/apple-laser-draw';
import { participantColor } from '@/lib/presence-utils';
import type { LaserTrailPoint, Viewport } from '@/lib/types';

type Props = {
  viewport: Viewport;
  width: number;
  height: number;
};

export default function AppleLaserLayer({ viewport, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const me = useSelf();
  const trails = useOthers((others) => {
    const list: { id: string; trail: LaserTrailPoint[]; color: string }[] = [];
    if (me?.presence.pointerMode === 'laser' && me.presence.laserTrail?.length) {
      list.push({
        id: me.id,
        trail: me.presence.laserTrail,
        color: me.presence.color || '#e03131',
      });
    }
    for (const other of others) {
      if (other.presence.pointerMode !== 'laser') continue;
      const trail = other.presence.laserTrail;
      if (!trail?.length) continue;
      list.push({
        id: other.id,
        trail,
        color: participantColor(other),
      });
    }
    return list;
  });

  useEffect(() => {
    if (width <= 0 || height <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;

    let raf = 0;
    const paint = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const { trail, color } of trails) {
        drawLaserTrail(ctx, trail, color, viewportRef.current);
      }
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [trails, width, height]);

  if (width <= 0 || height <= 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="laser-trails-layer"
      style={{ width, height }}
      aria-hidden
    />
  );
}
