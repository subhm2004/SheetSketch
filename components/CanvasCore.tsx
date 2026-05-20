'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import rough from 'roughjs';
import { Shape, Tool, Viewport, FillStyle, DEFAULT_SHAPE_STYLE } from '@/lib/types';
import { renderShapes, renderSelectionOverlay } from '@/lib/rough-renderer';
import { useCanvasEvents } from '@/hooks/useCanvasEvents';
import { canvasToScreen } from '@/lib/canvas-utils';

type StyleState = {
  strokeColor: string;
  fillColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  fontSize?: number;
};

type TextEditState = {
  canvasX: number;
  canvasY: number;
  left: number;
  top: number;
  shapeId?: string;
  value: string;
};

type Props = {
  shapes: Shape[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onAddShape: (s: Shape) => void;
  onUpdateShape: (id: string, patch: Partial<Shape>) => void;
  onDeleteShape: (id: string) => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  viewport: Viewport;
  setViewport: (vp: Viewport | ((prev: Viewport) => Viewport)) => void;
  tool: Tool;
  setTool: (t: Tool) => void;
  style: StyleState;
  setStyle: (patch: Partial<StyleState>) => void;
  children?: React.ReactNode;
};

export default function CanvasCore({
  shapes,
  selectedId,
  setSelectedId,
  onAddShape,
  onUpdateShape,
  onDeleteShape,
  onCopy,
  onPaste,
  onDuplicate,
  viewport,
  setViewport,
  tool,
  setTool,
  style,
  children,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const textEditRef = useRef<TextEditState | null>(null);
  const isTextEditingRef = useRef(false);
  const rafRef = useRef<number>(0);
  const [textEdit, setTextEdit] = useState<TextEditState | null>(null);

  const shapesRef = useRef<Shape[]>(shapes);
  const viewportRef = useRef<Viewport>(viewport);
  const selectedIdRef = useRef<string | null>(selectedId);
  const previewRef = useRef<Shape | null>(null);

  textEditRef.current = textEdit;
  isTextEditingRef.current = textEdit !== null;

  const openTextEditor = useCallback(
    (payload: { x: number; y: number; shapeId?: string; initialText?: string }) => {
      const { x: left, y: top } = canvasToScreen(payload.x, payload.y, viewportRef.current);
      setTextEdit({
        canvasX: payload.x,
        canvasY: payload.y,
        left,
        top,
        shapeId: payload.shapeId,
        value: payload.initialText ?? '',
      });
    },
    [],
  );

  const commitTextEdit = useCallback(() => {
    const edit = textEditRef.current;
    if (!edit) return;

    const trimmed = edit.value.trim();
    if (edit.shapeId) {
      if (trimmed) {
        onUpdateShape(edit.shapeId, { text: trimmed });
        setSelectedId(edit.shapeId);
      } else {
        onDeleteShape(edit.shapeId);
        setSelectedId(null);
      }
    } else if (trimmed) {
      const id = Math.random().toString(36).slice(2);
      const newShape: Shape = {
        id,
        type: 'text',
        x: edit.canvasX,
        y: edit.canvasY,
        text: trimmed,
        fontSize: style.fontSize ?? DEFAULT_SHAPE_STYLE.fontSize,
        seed: Math.floor(Math.random() * 2 ** 31),
        strokeColor: style.strokeColor,
        fillColor: 'transparent',
        fillStyle: 'none',
        strokeWidth: style.strokeWidth,
        roughness: 0,
        opacity: style.opacity,
      };
      onAddShape(newShape);
      setSelectedId(id);
      setTool('select');
    }
    textEditRef.current = null;
    setTextEdit(null);
  }, [onAddShape, onUpdateShape, onDeleteShape, setSelectedId, setTool, style]);

  const cancelTextEdit = useCallback(() => {
    textEditRef.current = null;
    setTextEdit(null);
  }, []);

  useEffect(() => {
    if (textEdit && textInputRef.current) {
      textInputRef.current.focus();
      const len = textEdit.value.length;
      textInputRef.current.setSelectionRange(len, len);
    }
  }, [textEdit]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      scheduleRender();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const scheduleRender = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rc = rough.canvas(canvas);
      const all = previewRef.current
        ? [...shapesRef.current, previewRef.current]
        : shapesRef.current;
      renderShapes(rc, ctx, all, viewportRef.current, selectedIdRef.current);
      if (selectedIdRef.current) {
        const sel = all.find((s) => s.id === selectedIdRef.current);
        if (sel) renderSelectionOverlay(ctx, sel, viewportRef.current);
      }
    });
  }, []);

  useEffect(() => {
    shapesRef.current = shapes;
    scheduleRender();
  }, [shapes, scheduleRender]);

  useEffect(() => {
    viewportRef.current = viewport;
    scheduleRender();
    setTextEdit((prev) => {
      if (!prev) return null;
      const { x: left, y: top } = canvasToScreen(prev.canvasX, prev.canvasY, viewport);
      return { ...prev, left, top };
    });
  }, [viewport, scheduleRender]);
  useEffect(() => {
    selectedIdRef.current = selectedId;
    scheduleRender();
  }, [selectedId, scheduleRender]);

  const {
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
  } = useCanvasEvents({
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
    onCopy,
    onPaste,
    onDuplicate,
    onToolChange: setTool,
    isTextEditingRef,
    onRequestTextEdit: openTextEditor,
  });

  useEffect(() => {
    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [onWindowMouseMove, onWindowMouseUp]);

  useEffect(() => {
    previewRef.current = preview;
    scheduleRender();
  }, [preview, scheduleRender]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (textEditRef.current) {
        if (e.key === 'Escape') {
          e.preventDefault();
          cancelTextEdit();
        }
        return;
      }

      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const map: Record<string, Tool> = {
        v: 'select',
        r: 'rectangle',
        c: 'ellipse',
        l: 'line',
        a: 'arrow',
        p: 'freehand',
        t: 'text',
        e: 'eraser',
      };
      if (map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()]);
      onKeyDown(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyDown, onKeyUp, setTool, cancelTextEdit]);

  const getCursor = () => {
    if (textEdit) return 'text';
    if (tool === 'eraser') return 'cell';
    if (tool === 'text') return 'text';
    if (tool === 'select') return 'default';
    return 'crosshair';
  };

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (textEditRef.current) {
        commitTextEdit();
        isTextEditingRef.current = false;
      }
      onMouseDown(e);
    },
    [commitTextEdit, onMouseDown],
  );

  const fontSize = style.fontSize ?? DEFAULT_SHAPE_STYLE.fontSize ?? 24;

  return (
    <div
      ref={containerRef}
      className="canvas-core-layer"
      style={{ zIndex: textEdit ? 50 : undefined }}
    >
      <canvas
        ref={(el) => {
          canvasRef.current = el;
          bindCanvasRef(el);
        }}
        style={{ cursor: getCursor(), display: 'block', touchAction: 'none', width: '100%', height: '100%' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
      />
      {textEdit && (
        <textarea
          ref={textInputRef}
          className="canvas-text-input"
          value={textEdit.value}
          onChange={(e) => setTextEdit((prev) => (prev ? { ...prev, value: e.target.value } : null))}
          onBlur={commitTextEdit}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              commitTextEdit();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              cancelTextEdit();
            }
          }}
          style={{
            left: textEdit.left,
            top: textEdit.top,
            fontSize,
            color: style.strokeColor,
            minWidth: 160,
            minHeight: fontSize * 1.4,
          }}
          placeholder="Type here…"
          autoFocus
        />
      )}
      {children}
    </div>
  );
}
