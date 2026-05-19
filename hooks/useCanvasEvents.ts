import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Shape,
  Tool,
  Viewport,
  FillStyle,
  DRAW_TOOLS,
} from '@/lib/types';
import {
  screenToCanvas,
  hitTest,
  getResizeHandles,
  applyResize,
  normalizeShape,
  clampZoom,
} from '@/lib/canvas-utils';

type StyleState = {
  strokeColor: string;
  fillColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  fontSize?: number;
};

type UseCanvasEventsProps = {
  tool: Tool;
  viewport: Viewport;
  setViewport: (vp: Viewport | ((prev: Viewport) => Viewport)) => void;
  shapes: Shape[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  style: StyleState;
  onAddShape: (shape: Shape) => void;
  onUpdateShape: (id: string, patch: Partial<Shape>) => void;
  onDeleteShape: (id: string) => void;
  onToolChange: (tool: Tool) => void;
  isTextEditingRef?: React.MutableRefObject<boolean>;
  onRequestTextEdit?: (payload: {
    x: number;
    y: number;
    shapeId?: string;
    initialText?: string;
  }) => void;
};

function isDrawTool(tool: Tool): tool is (typeof DRAW_TOOLS)[number] {
  return (DRAW_TOOLS as readonly string[]).includes(tool);
}

export function useCanvasEvents({
  tool,
  viewport,
  setViewport,
  shapes,
  selectedId,
  setSelectedId,
  style,
  onAddShape,
  onUpdateShape,
  onDeleteShape,
  onToolChange,
  isTextEditingRef,
  onRequestTextEdit,
}: UseCanvasEventsProps) {
  const [preview, setPreviewState] = useState<Shape | null>(null);
  const previewRef = useRef<Shape | null>(null);
  const viewportRef = useRef(viewport);
  const shapesRef = useRef(shapes);
  const selectedIdRef = useRef(selectedId);
  const styleRef = useRef(style);
  const toolRef = useRef(tool);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  viewportRef.current = viewport;
  shapesRef.current = shapes;
  selectedIdRef.current = selectedId;
  styleRef.current = style;
  toolRef.current = tool;

  const isEditingText = () => isTextEditingRef?.current ?? false;

  const setPreview = useCallback((next: Shape | null | ((prev: Shape | null) => Shape | null)) => {
    setPreviewState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;
      previewRef.current = value;
      return value;
    });
  }, []);

  const drag = useRef<{
    type: 'draw' | 'move' | 'resize' | 'pan' | 'erase';
    startX: number;
    startY: number;
    shapeStartX?: number;
    shapeStartY?: number;
    shapeStartX2?: number;
    shapeStartY2?: number;
    shapeStartPoints?: [number, number][];
    handleId?: string;
    lastX?: number;
    lastY?: number;
    erasedIds?: Set<string>;
  } | null>(null);

  const isPanning = useRef(false);
  const spaceDown = useRef(false);

  const eraseAt = useCallback(
    (cx: number, cy: number, erasedIds: Set<string>) => {
      const currentShapes = shapesRef.current;
      const currentSelected = selectedIdRef.current;
      const zoom = viewportRef.current.zoom;

      for (let i = currentShapes.length - 1; i >= 0; i--) {
        const shape = currentShapes[i];
        if (erasedIds.has(shape.id)) continue;
        if (hitTest(shape, cx, cy, zoom)) {
          erasedIds.add(shape.id);
          onDeleteShape(shape.id);
          if (currentSelected === shape.id) setSelectedId(null);
        }
      }
    },
    [onDeleteShape, setSelectedId],
  );

  const canvasPointFromClient = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasElRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    return {
      sx,
      sy,
      ...screenToCanvas(sx, sy, viewportRef.current),
    };
  }, []);

  const finishDrag = useCallback(() => {
    isPanning.current = false;

    if (drag.current?.type === 'draw' && previewRef.current) {
      const normalized = normalizeShape(previewRef.current);
      const isDegenerate =
        (normalized.type === 'rectangle' || normalized.type === 'ellipse') &&
        (Math.abs(normalized.width ?? 0) < 3 || Math.abs(normalized.height ?? 0) < 3);
      const isLineDegenerate =
        (normalized.type === 'line' || normalized.type === 'arrow') &&
        Math.hypot(
          (normalized.x2 ?? normalized.x) - normalized.x,
          (normalized.y2 ?? normalized.y) - normalized.y,
        ) < 3;

      if (!isDegenerate && !isLineDegenerate) {
        onAddShape(normalized);
        setSelectedId(normalized.id);
        onToolChange('select');
      }
      setPreview(null);
    }

    if (drag.current?.type === 'resize' && selectedIdRef.current) {
      const sel = shapesRef.current.find((s) => s.id === selectedIdRef.current);
      if (sel) onUpdateShape(selectedIdRef.current, normalizeShape(sel));
    }

    drag.current = null;
  }, [onAddShape, onUpdateShape, setSelectedId, onToolChange, setPreview]);

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      const pt = canvasPointFromClient(clientX, clientY);
      if (!pt || !drag.current) return;

      const { sx, sy, x: cx, y: cy } = pt;

      if (drag.current.type === 'pan') {
        const dx = sx - (drag.current.lastX ?? sx);
        const dy = sy - (drag.current.lastY ?? sy);
        drag.current.lastX = sx;
        drag.current.lastY = sy;
        setViewport((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        return;
      }

      if (drag.current.type === 'erase' && drag.current.erasedIds) {
        eraseAt(cx, cy, drag.current.erasedIds);
        return;
      }

      const currentSelectedId = selectedIdRef.current;
      const currentShapes = shapesRef.current;

      if (drag.current.type === 'move' && currentSelectedId) {
        const dx = cx - drag.current.startX;
        const dy = cy - drag.current.startY;
        const sel = currentShapes.find((s) => s.id === currentSelectedId);
        if (!sel) return;
        const patch: Partial<Shape> = {
          x: (drag.current.shapeStartX ?? sel.x) + dx,
          y: (drag.current.shapeStartY ?? sel.y) + dy,
        };
        if (sel.type === 'line' || sel.type === 'arrow') {
          patch.x2 = (drag.current.shapeStartX2 ?? sel.x2 ?? sel.x) + dx;
          patch.y2 = (drag.current.shapeStartY2 ?? sel.y2 ?? sel.y) + dy;
        }
        if (sel.type === 'freehand' && drag.current.shapeStartPoints) {
          patch.points = drag.current.shapeStartPoints.map((p) => [p[0] + dx, p[1] + dy]);
        }
        onUpdateShape(currentSelectedId, patch);
        return;
      }

      if (drag.current.type === 'resize' && currentSelectedId && drag.current.handleId) {
        const sel = currentShapes.find((s) => s.id === currentSelectedId);
        if (!sel) return;
        const dx = cx - drag.current.startX;
        const dy = cy - drag.current.startY;
        drag.current.startX = cx;
        drag.current.startY = cy;
        const patch = applyResize(sel, drag.current.handleId, dx, dy);
        onUpdateShape(currentSelectedId, patch);
        return;
      }

      if (drag.current.type === 'draw' && previewRef.current) {
        const { startX, startY } = drag.current;
        setPreview((prev) => {
          if (!prev) return null;
          if (prev.type === 'rectangle' || prev.type === 'ellipse') {
            return { ...prev, width: cx - startX, height: cy - startY };
          }
          if (prev.type === 'line' || prev.type === 'arrow') {
            return { ...prev, x2: cx, y2: cy };
          }
          if (prev.type === 'freehand') {
            return { ...prev, points: [...(prev.points ?? []), [cx, cy]] };
          }
          return prev;
        });
      }
    },
    [canvasPointFromClient, eraseAt, onUpdateShape, setPreview, setViewport],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      canvasElRef.current = e.currentTarget;
      if (e.button !== 0) {
        if (e.button === 1) {
          const pt = canvasPointFromClient(e.clientX, e.clientY);
          if (!pt) return;
          drag.current = {
            type: 'pan',
            startX: pt.sx,
            startY: pt.sy,
            lastX: pt.sx,
            lastY: pt.sy,
          };
          isPanning.current = true;
        }
        return;
      }

      if (isEditingText()) return;

      const pt = canvasPointFromClient(e.clientX, e.clientY);
      if (!pt) return;

      const { sx, sy, x: cx, y: cy } = pt;
      const currentTool = toolRef.current;
      const currentShapes = shapesRef.current;
      const currentSelectedId = selectedIdRef.current;
      const currentStyle = styleRef.current;

      const spaceHeld = e.getModifierState('Space') || spaceDown.current;
      if (spaceHeld) {
        drag.current = { type: 'pan', startX: sx, startY: sy, lastX: sx, lastY: sy };
        isPanning.current = true;
        return;
      }

      if (currentTool === 'eraser') {
        const erasedIds = new Set<string>();
        drag.current = { type: 'erase', startX: cx, startY: cy, erasedIds };
        eraseAt(cx, cy, erasedIds);
        return;
      }

      if (currentTool === 'text') {
        onRequestTextEdit?.({ x: cx, y: cy });
        return;
      }

      if (currentTool === 'select') {
        if (currentSelectedId) {
          const selected = currentShapes.find((s) => s.id === currentSelectedId);
          if (selected) {
            const handles = getResizeHandles(selected);
            const threshold = 8 / viewportRef.current.zoom;
            for (const h of handles) {
              if (Math.hypot(cx - h.x, cy - h.y) <= threshold) {
                drag.current = {
                  type: 'resize',
                  startX: cx,
                  startY: cy,
                  handleId: h.id,
                  shapeStartX: selected.x,
                  shapeStartY: selected.y,
                };
                return;
              }
            }
          }
        }

        for (let i = currentShapes.length - 1; i >= 0; i--) {
          if (hitTest(currentShapes[i], cx, cy, viewportRef.current.zoom)) {
            setSelectedId(currentShapes[i].id);
            drag.current = {
              type: 'move',
              startX: cx,
              startY: cy,
              shapeStartX: currentShapes[i].x,
              shapeStartY: currentShapes[i].y,
              shapeStartX2: currentShapes[i].x2,
              shapeStartY2: currentShapes[i].y2,
              shapeStartPoints: currentShapes[i].points
                ? currentShapes[i].points!.map((p) => [p[0], p[1]] as [number, number])
                : undefined,
              lastX: cx,
              lastY: cy,
            };
            return;
          }
        }
        setSelectedId(null);
        return;
      }

      if (!isDrawTool(currentTool)) return;

      const id = Math.random().toString(36).slice(2);
      const seed = Math.floor(Math.random() * 2 ** 31);
      const newShape: Shape = {
        id,
        type: currentTool,
        x: cx,
        y: cy,
        seed,
        ...currentStyle,
        ...(currentTool === 'rectangle' || currentTool === 'ellipse'
          ? { width: 0, height: 0 }
          : {}),
        ...(currentTool === 'line' || currentTool === 'arrow' ? { x2: cx, y2: cy } : {}),
        ...(currentTool === 'freehand' ? { points: [[cx, cy]] } : {}),
      };
      setPreview(newShape);
      drag.current = { type: 'draw', startX: cx, startY: cy };
    },
    [canvasPointFromClient, eraseAt, onRequestTextEdit, setPreview, setSelectedId],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      canvasElRef.current = e.currentTarget;
      handlePointerMove(e.clientX, e.clientY);
    },
    [handlePointerMove],
  );

  const onMouseUp = useCallback(() => {
    finishDrag();
  }, [finishDrag]);

  const onDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isEditingText() || toolRef.current !== 'select') return;
      const pt = canvasPointFromClient(e.clientX, e.clientY);
      if (!pt) return;
      const { x: cx, y: cy } = pt;

      for (let i = shapesRef.current.length - 1; i >= 0; i--) {
        const shape = shapesRef.current[i];
        if (shape.type === 'text' && hitTest(shape, cx, cy, viewportRef.current.zoom)) {
          onRequestTextEdit?.({
            x: shape.x,
            y: shape.y,
            shapeId: shape.id,
            initialText: shape.text ?? '',
          });
          return;
        }
      }
    },
    [canvasPointFromClient, onRequestTextEdit],
  );

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey) {
        const delta = -e.deltaY * 0.001;
        setViewport((prev) => {
          const newZoom = clampZoom(prev.zoom * (1 + delta));
          const scale = newZoom / prev.zoom;
          return {
            zoom: newZoom,
            x: sx - (sx - prev.x) * scale,
            y: sy - (sy - prev.y) * scale,
          };
        });
      } else if (e.shiftKey) {
        setViewport((prev) => ({ ...prev, x: prev.x - e.deltaY }));
      } else {
        setViewport((prev) => ({
          ...prev,
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    [setViewport],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceDown.current = true;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIdRef.current && document.activeElement?.tagName !== 'INPUT') {
          onDeleteShape(selectedIdRef.current);
          setSelectedId(null);
        }
      }
      if (e.key === 'Escape') setSelectedId(null);
    },
    [onDeleteShape, setSelectedId],
  );

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') spaceDown.current = false;
  }, []);

  useEffect(() => {
    const resetSpace = () => {
      spaceDown.current = false;
    };
    window.addEventListener('blur', resetSpace);
    return () => window.removeEventListener('blur', resetSpace);
  }, []);

  const onMouseLeave = useCallback(() => {}, []);

  const bindCanvasRef = useCallback((el: HTMLCanvasElement | null) => {
    canvasElRef.current = el;
  }, []);

  const onWindowMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!drag.current) return;
      handlePointerMove(e.clientX, e.clientY);
    },
    [handlePointerMove],
  );

  const onWindowMouseUp = useCallback(() => {
    if (!drag.current) return;
    finishDrag();
  }, [finishDrag]);

  return {
    preview,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onDoubleClick,
    onWheel,
    onKeyDown,
    onKeyUp,
    onMouseLeave,
    bindCanvasRef,
    onWindowMouseMove,
    onWindowMouseUp,
  };
}
