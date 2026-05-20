'use client';

import { useCallback, useRef } from 'react';
import type { Shape } from '@/lib/types';
import {
  cloneShapeWithOffset,
  nextPasteOffset,
  snapshotShape,
} from '@/lib/shape-clipboard';

type Options = {
  shapes: Shape[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onAddShape: (shape: Shape) => void;
};

export function useShapeClipboard({
  shapes,
  selectedId,
  setSelectedId,
  onAddShape,
}: Options) {
  const clipboardRef = useRef<Shape | null>(null);
  const pasteCountRef = useRef(0);

  const getSelectedShape = useCallback(() => {
    if (!selectedId) return null;
    return shapes.find((s) => s.id === selectedId) ?? null;
  }, [shapes, selectedId]);

  const copySelected = useCallback(() => {
    const shape = getSelectedShape();
    if (!shape) return false;
    clipboardRef.current = snapshotShape(shape);
    pasteCountRef.current = 0;
    return true;
  }, [getSelectedShape]);

  const pasteClipboard = useCallback(() => {
    const source = clipboardRef.current;
    if (!source) return false;
    const { dx, dy } = nextPasteOffset(pasteCountRef.current);
    pasteCountRef.current += 1;
    const pasted = cloneShapeWithOffset(source, dx, dy);
    onAddShape(pasted);
    setSelectedId(pasted.id);
    return true;
  }, [onAddShape, setSelectedId]);

  const duplicateSelected = useCallback(() => {
    const shape = getSelectedShape();
    if (!shape) return false;
    const { dx, dy } = nextPasteOffset(0);
    const dup = cloneShapeWithOffset(shape, dx, dy);
    onAddShape(dup);
    setSelectedId(dup.id);
    clipboardRef.current = snapshotShape(shape);
    pasteCountRef.current = 1;
    return true;
  }, [getSelectedShape, onAddShape, setSelectedId]);

  return { copySelected, pasteClipboard, duplicateSelected };
}
