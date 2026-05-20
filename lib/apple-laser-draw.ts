import type { LaserTrailPoint } from './types';
import { laserGlowColor } from './color-utils';
import { canvasToScreen } from './canvas-utils';
import type { Viewport } from './types';

export function drawLaserTrail(
  ctx: CanvasRenderingContext2D,
  trail: LaserTrailPoint[],
  color: string,
  viewport: Viewport,
) {
  if (trail.length < 2) return;

  const screenPts = trail.map((p) => {
    const s = canvasToScreen(p.x, p.y, viewport);
    return { ...s, t: p.t };
  });

  const now = Date.now();
  const glow = laserGlowColor(color);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 1; i < screenPts.length; i++) {
    const a = screenPts[i - 1];
    const b = screenPts[i];
    const age = (now - b.t) / 420;
    const alpha = Math.max(0.08, 1 - age);
    const width = Math.max(2, 10 * alpha);

    ctx.strokeStyle = glow.replace(/[\d.]+\)$/, `${alpha * 0.85})`);
    ctx.lineWidth = width;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 14 * alpha;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  const last = screenPts[screenPts.length - 1];
  ctx.shadowBlur = 18;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
