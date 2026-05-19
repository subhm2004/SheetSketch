import rough from 'roughjs';
import type { RoughSVG } from 'roughjs/bin/svg';
import { Shape } from './types';
import { getBoundingBox } from './canvas-utils';
import { getShapeRoughOptions, renderShapes } from './rough-renderer';
import type { Viewport } from './types';

const EXPORT_PADDING = 40;
const DEFAULT_BG = '#ffffff';

export type ExportBounds = {
  minX: number;
  minY: number;
  width: number;
  height: number;
};

export function getExportBounds(
  shapes: Shape[],
  padding = EXPORT_PADDING,
): ExportBounds | null {
  if (shapes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const shape of shapes) {
    const bb = getBoundingBox(shape);
    if (bb.w === 0 && bb.h === 0 && shape.type !== 'text') continue;
    minX = Math.min(minX, bb.x);
    minY = Math.min(minY, bb.y);
    maxX = Math.max(maxX, bb.x + bb.w);
    maxY = Math.max(maxY, bb.y + bb.h);
  }

  if (!isFinite(minX)) return null;

  return {
    minX: minX - padding,
    minY: minY - padding,
    width: Math.max(maxX - minX + padding * 2, 1),
    height: Math.max(maxY - minY + padding * 2, 1),
  };
}

function exportViewport(bounds: ExportBounds): Viewport {
  return { x: -bounds.minX, y: -bounds.minY, zoom: 1 };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadText(text: string, filename: string, mime: string) {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

function stampFilename(roomId: string, ext: 'png' | 'svg') {
  const date = new Date().toISOString().slice(0, 10);
  const safeRoom = roomId.replace(/[^a-z0-9-]/gi, '-').slice(0, 32);
  return `sheetsketch-${safeRoom}-${date}.${ext}`;
}

function appendArrowheadSvg(
  parent: SVGGElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  strokeWidth: number,
  opacity: number,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = Math.max(12, strokeWidth * 5);
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const d = [
    `M ${x2} ${y2}`,
    `L ${x2 - size * Math.cos(angle - Math.PI / 6)} ${y2 - size * Math.sin(angle - Math.PI / 6)}`,
    `M ${x2} ${y2}`,
    `L ${x2 - size * Math.cos(angle + Math.PI / 6)} ${y2 - size * Math.sin(angle + Math.PI / 6)}`,
  ].join(' ');
  path.setAttribute('d', d);
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', String(strokeWidth));
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('opacity', String(opacity));
  parent.appendChild(path);
}

function renderShapeToSvg(rc: RoughSVG, parent: SVGGElement, shape: Shape) {
  const opts = getShapeRoughOptions(shape);
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('opacity', String(shape.opacity));

  switch (shape.type) {
    case 'rectangle': {
      const bb = getBoundingBox(shape);
      g.appendChild(rc.rectangle(bb.x, bb.y, bb.w, bb.h, opts));
      break;
    }
    case 'ellipse': {
      const bb = getBoundingBox(shape);
      g.appendChild(rc.ellipse(bb.x + bb.w / 2, bb.y + bb.h / 2, bb.w, bb.h, opts));
      break;
    }
    case 'line': {
      g.appendChild(
        rc.line(shape.x, shape.y, shape.x2 ?? shape.x, shape.y2 ?? shape.y, opts),
      );
      break;
    }
    case 'arrow': {
      const x2 = shape.x2 ?? shape.x;
      const y2 = shape.y2 ?? shape.y;
      g.appendChild(rc.line(shape.x, shape.y, x2, y2, opts));
      appendArrowheadSvg(g, shape.x, shape.y, x2, y2, shape.strokeColor, shape.strokeWidth, shape.opacity);
      break;
    }
    case 'freehand': {
      const pts = shape.points ?? [];
      if (pts.length > 1) {
        g.appendChild(rc.curve(pts as [number, number][], { ...opts, roughness: 0.5 }));
      }
      break;
    }
    case 'text': {
      const fontSize = shape.fontSize ?? 24;
      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textEl.setAttribute('x', String(shape.x));
      textEl.setAttribute('y', String(shape.y));
      textEl.setAttribute('fill', shape.strokeColor);
      textEl.setAttribute('font-size', String(fontSize));
      textEl.setAttribute('font-weight', '600');
      textEl.setAttribute('font-family', 'Nunito, system-ui, sans-serif');
      textEl.setAttribute('dominant-baseline', 'hanging');
      textEl.textContent = shape.text ?? '';
      g.appendChild(textEl);
      break;
    }
  }

  parent.appendChild(g);
}

function buildSvgDocument(shapes: Shape[], bg = DEFAULT_BG): string {
  const bounds = getExportBounds(shapes);
  if (!bounds) throw new Error('Nothing to export');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', String(Math.ceil(bounds.width)));
  svg.setAttribute('height', String(Math.ceil(bounds.height)));
  svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);

  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('fill', bg);
  svg.appendChild(bgRect);

  const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  layer.setAttribute('transform', `translate(${-bounds.minX}, ${-bounds.minY})`);
  svg.appendChild(layer);

  const rc = rough.svg(svg);
  for (const shape of shapes) {
    renderShapeToSvg(rc, layer, shape);
  }

  return new XMLSerializer().serializeToString(svg);
}

export async function exportShapesToPng(
  shapes: Shape[],
  roomId: string,
  bg = DEFAULT_BG,
): Promise<void> {
  const bounds = getExportBounds(shapes);
  if (!bounds) throw new Error('Nothing to export');

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(bounds.width);
  canvas.height = Math.ceil(bounds.height);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const rc = rough.canvas(canvas);
  renderShapes(rc, ctx, shapes, exportViewport(bounds), null);

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('PNG export failed'));
        return;
      }
      downloadBlob(blob, stampFilename(roomId, 'png'));
      resolve();
    }, 'image/png');
  });
}

export function exportShapesToSvg(shapes: Shape[], roomId: string, bg = DEFAULT_BG): void {
  const markup = buildSvgDocument(shapes, bg);
  downloadText(markup, stampFilename(roomId, 'svg'), 'image/svg+xml;charset=utf-8');
}

/** Selected shape if any, otherwise full board. */
export function shapesForExport(all: Shape[], selectedId: string | null): Shape[] {
  if (!selectedId) return all;
  const one = all.filter((s) => s.id === selectedId);
  return one.length > 0 ? one : all;
}
