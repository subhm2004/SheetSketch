export type ShapeType = 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'freehand' | 'text';

export type FillStyle = 'hachure' | 'solid' | 'cross-hatch' | 'dots' | 'none';

export type Shape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  x2?: number;
  y2?: number;
  points?: [number, number][];
  text?: string;
  fontSize?: number;
  strokeColor: string;
  fillColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  seed: number;
};

export type Tool =
  | 'select'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'freehand'
  | 'text'
  | 'eraser';

export const DRAW_TOOLS = [
  'rectangle',
  'ellipse',
  'line',
  'arrow',
  'freehand',
] as const satisfies readonly ShapeType[];

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

export type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
};

export type ChatMessage = {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userColor: string;
  createdAt: number;
};

export type Storage = {
  shapes: Shape[];
  messages: ChatMessage[];
};

export type RoomUser = {
  name: string;
  color: string;
};

export const DEFAULT_SHAPE_STYLE = {
  strokeColor: '#1e1e1e',
  fillColor: 'transparent',
  fillStyle: 'hachure' as FillStyle,
  strokeWidth: 2,
  roughness: 1.5,
  opacity: 1,
  fontSize: 24,
};

export const USER_COLORS = [
  '#e03131', '#c2255c', '#9c36b5', '#6741d9', '#3b5bdb',
  '#1971c2', '#0c8599', '#099268', '#2f9e44', '#e8590c',
];
