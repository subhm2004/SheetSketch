import { DEFAULT_SHAPE_STYLE, type FillStyle, type Shape, type ShapeType } from './types';

const ALLOWED_TYPES: ShapeType[] = ['rectangle', 'ellipse', 'line', 'arrow', 'text'];

const ALLOWED_FILLS: FillStyle[] = ['hachure', 'solid', 'cross-hatch', 'dots', 'none'];

type AiShapeInput = {
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  x2?: number;
  y2?: number;
  text?: string;
  fontSize?: number;
  strokeColor?: string;
  fillColor?: string;
  fillStyle?: string;
  strokeWidth?: number;
  roughness?: number;
  opacity?: number;
};

type AiResponse = {
  shapes?: AiShapeInput[];
  message?: string;
};

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function color(v: unknown, fallback: string) {
  return typeof v === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : fallback;
}

function fillStyle(v: unknown): FillStyle {
  return typeof v === 'string' && (ALLOWED_FILLS as string[]).includes(v)
    ? (v as FillStyle)
    : DEFAULT_SHAPE_STYLE.fillStyle;
}

function normalizeShape(raw: AiShapeInput, index: number): Shape | null {
  if (!raw.type || !ALLOWED_TYPES.includes(raw.type as ShapeType)) return null;

  const type = raw.type as ShapeType;
  const x = num(raw.x, 120 + index * 12);
  const y = num(raw.y, 120 + index * 8);

  const base: Shape = {
    id: `ai_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    x,
    y,
    strokeColor: color(raw.strokeColor, DEFAULT_SHAPE_STYLE.strokeColor),
    fillColor: color(raw.fillColor, type === 'text' ? 'transparent' : '#a5d8ff'),
    fillStyle: type === 'text' ? 'none' : fillStyle(raw.fillStyle),
    strokeWidth: clamp(num(raw.strokeWidth, DEFAULT_SHAPE_STYLE.strokeWidth), 1, 8),
    roughness: clamp(num(raw.roughness, DEFAULT_SHAPE_STYLE.roughness), 0, 3),
    opacity: clamp(num(raw.opacity, 1), 0.1, 1),
    seed: Math.floor(Math.random() * 2 ** 31),
  };

  if (type === 'rectangle' || type === 'ellipse') {
    base.width = clamp(num(raw.width, 160), 8, 1200);
    base.height = clamp(num(raw.height, 100), 8, 900);
  }

  if (type === 'line' || type === 'arrow') {
    base.x2 = num(raw.x2, x + 140);
    base.y2 = num(raw.y2, y + 80);
  }

  if (type === 'text') {
    base.text = typeof raw.text === 'string' && raw.text.trim() ? raw.text.trim().slice(0, 200) : 'Label';
    base.fontSize = clamp(num(raw.fontSize, DEFAULT_SHAPE_STYLE.fontSize ?? 24), 12, 96);
    base.fillColor = 'transparent';
    base.fillStyle = 'none';
  }

  return base;
}

export function parseAiDrawResponse(
  payload: unknown,
): { shapes: Shape[]; message?: string } {
  const data = (typeof payload === 'object' && payload !== null ? payload : {}) as AiResponse;
  const list = Array.isArray(data.shapes) ? data.shapes : [];

  const shapes = list
    .map((item, i) => normalizeShape(item, i))
    .filter((s): s is Shape => s !== null);

  if (shapes.length === 0) {
    throw new Error('AI did not return any valid shapes. Try a clearer prompt.');
  }

  return {
    shapes,
    message: typeof data.message === 'string' ? data.message : undefined,
  };
}

export const AI_DRAW_SYSTEM_PROMPT = `You are SheetSketch's AI drawing assistant. Given a user prompt, output JSON only (no markdown) with this exact structure:
{
  "message": "short friendly note (optional)",
  "shapes": [ ... ]
}

Each shape must be one of: rectangle, ellipse, line, arrow, text.
Use coordinates in the canvas bounds the user provides. Place drawings centered in those bounds.
Use hand-drawn style colors: stroke #1e1e1e, fills like #a5d8ff #b2f2bb #ffd8a8 #ffc9c9 #d0bfff.
fillStyle: solid | hachure | none.

Shape fields:
- rectangle/ellipse: x, y, width, height
- line/arrow: x, y, x2, y2 (start and end)
- text: x, y, text, fontSize

Create 3–12 shapes for simple requests, more for complex diagrams. Keep sizes reasonable (width/height 40–400).`;
