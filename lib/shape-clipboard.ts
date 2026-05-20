import type { Shape } from '@/lib/types';

const PASTE_STEP = 16;

export function createShapeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  }
  return Math.random().toString(36).slice(2, 14);
}

/** Deep copy shape data for the internal clipboard (keeps original id). */
export function snapshotShape(shape: Shape): Shape {
  return {
    ...shape,
    points: shape.points?.map((p) => [p[0], p[1]] as [number, number]),
  };
}

/** Clone shape with new id/seed and canvas offset. */
export function cloneShapeWithOffset(shape: Shape, dx: number, dy: number): Shape {
  const id = createShapeId();
  const seed = Math.floor(Math.random() * 2 ** 31);

  const base: Shape = { ...shape, id, seed };

  switch (shape.type) {
    case 'rectangle':
    case 'ellipse':
    case 'text':
      return { ...base, x: shape.x + dx, y: shape.y + dy };
    case 'line':
    case 'arrow':
      return {
        ...base,
        x: shape.x + dx,
        y: shape.y + dy,
        x2: (shape.x2 ?? shape.x) + dx,
        y2: (shape.y2 ?? shape.y) + dy,
      };
    case 'freehand':
      return {
        ...base,
        x: shape.x + dx,
        y: shape.y + dy,
        points: shape.points?.map((p) => [p[0] + dx, p[1] + dy] as [number, number]),
      };
  }
}

export function nextPasteOffset(pasteCount: number): { dx: number; dy: number } {
  const n = pasteCount + 1;
  return { dx: PASTE_STEP * n, dy: PASTE_STEP * n };
}
