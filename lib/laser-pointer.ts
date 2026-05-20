import type { LaserTrailPoint } from './types';

const MAX_POINTS = 28;
const MAX_AGE_MS = 420;

export function appendLaserPoint(
  trail: LaserTrailPoint[] | null | undefined,
  x: number,
  y: number,
): LaserTrailPoint[] {
  const now = Date.now();
  const next = [...(trail ?? []), { x, y, t: now }];
  return next
    .filter((p) => now - p.t <= MAX_AGE_MS)
    .slice(-MAX_POINTS);
}
