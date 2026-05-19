'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Image, FileCode2 } from 'lucide-react';
import { Shape } from '@/lib/types';
import {
  exportShapesToPng,
  exportShapesToSvg,
  getExportBounds,
  shapesForExport,
} from '@/lib/canvas-export';

type Props = {
  shapes: Shape[];
  selectedId: string | null;
  roomId: string;
};

export default function ExportMenu({ shapes, selectedId, roomId }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const exportSet = shapesForExport(shapes, selectedId);
  const canExport = getExportBounds(exportSet) !== null;
  const selectionMode = selectedId && exportSet.length === 1;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const runExport = useCallback(
    async (format: 'png' | 'svg') => {
      if (!canExport || busy) return;
      setBusy(true);
      setOpen(false);
      try {
        if (format === 'png') {
          await exportShapesToPng(exportSet, roomId);
        } else {
          exportShapesToSvg(exportSet, roomId);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Export failed';
        window.alert(msg);
      } finally {
        setBusy(false);
      }
    },
    [busy, canExport, exportSet, roomId],
  );

  return (
    <div ref={rootRef} className="export-menu-root">
      <button
        type="button"
        className={`header-action-btn export-toggle-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-expanded={open}
        aria-haspopup="menu"
        title={canExport ? 'Export canvas' : 'Add shapes to export'}
      >
        <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
        <span className="btn-label">Export</span>
      </button>

      {open && (
        <div className="export-menu-dropdown" role="menu">
          <p className="export-menu-hint">
            {selectionMode ? 'Exporting selected shape' : 'Exporting full board'}
          </p>
          <button
            type="button"
            role="menuitem"
            className="export-menu-item"
            disabled={!canExport || busy}
            onClick={() => runExport('png')}
          >
            <span className="export-menu-item-icon" aria-hidden>
              <Image className="h-4 w-4" strokeWidth={2} />
            </span>
            <span>Download PNG</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="export-menu-item"
            disabled={!canExport || busy}
            onClick={() => runExport('svg')}
          >
            <span className="export-menu-item-icon" aria-hidden>
              <FileCode2 className="h-4 w-4" strokeWidth={2} />
            </span>
            <span>Download SVG</span>
          </button>
        </div>
      )}
    </div>
  );
}
