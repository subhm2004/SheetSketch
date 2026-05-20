'use client';

import { useState, useRef, useEffect } from 'react';
import { LiveObject } from '@liveblocks/client';
import { useStorage, useMutation } from '@/lib/liveblocks';
import { Shape, Tool, Viewport, FillStyle, DEFAULT_SHAPE_STYLE, PresentationPointer } from '@/lib/types';
import { useRoomPresence } from '@/hooks/useRoomPresence';
import { useChatUnread } from '@/hooks/useChatUnread';
import { useShapeClipboard } from '@/hooks/useShapeClipboard';
import CanvasCore from './CanvasCore';
import LiveCursors from './LiveCursors';
import Presence from './Presence';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import RoomChat from './RoomChat';
import RoomAI from './RoomAI';
import InviteButton from './InviteButton';
import ExportMenu from './ExportMenu';
import PresentationBar from './PresentationBar';
import AppleLaserLayer from './AppleLaserLayer';
import { ThemeToggle } from './ThemeToggle';

type StyleState = {
  strokeColor: string;
  fillColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  fontSize?: number;
};

type Props = { roomId: string };

export default function Canvas({ roomId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [tool, setTool] = useState<Tool>('select');
  const [style, setStyle] = useState<StyleState>(DEFAULT_SHAPE_STYLE);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperSize, setWrapperSize] = useState({ w: 800, h: 600 });
  const [chatOpen, setChatOpen] = useState(false);
  const chatHasUnread = useChatUnread(chatOpen);
  const [aiOpen, setAiOpen] = useState(false);
  const [showOthersCursors, setShowOthersCursors] = useState(true);
  const [presentationPointer, setPresentationPointer] = useState<PresentationPointer>('off');

  useEffect(() => {
    const stored = sessionStorage.getItem('show_others_cursors');
    if (stored === 'false') setShowOthersCursors(false);
  }, []);

  const toggleOthersCursors = () => {
    setShowOthersCursors((on) => {
      const next = !on;
      sessionStorage.setItem('show_others_cursors', String(next));
      return next;
    });
  };

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const syncSize = () => {
      setWrapperSize({ w: el.clientWidth, h: el.clientHeight });
    };
    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useRoomPresence({ wrapperRef, viewport, pointerMode: presentationPointer });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'Escape') setPresentationPointer('off');
      if (e.key === 'k' || e.key === 'K') {
        setPresentationPointer((m) => (m === 'laser' ? 'off' : 'laser'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const shapes = useStorage((root) => root.shapes.map((s) => ({ ...s }))) ?? [];

  const addShape = useMutation(({ storage }, shape: Shape) => {
    storage.get('shapes').push(new LiveObject(shape));
  }, []);

  const addShapes = useMutation(({ storage }, newShapes: Shape[]) => {
    const list = storage.get('shapes');
    for (const shape of newShapes) {
      list.push(new LiveObject(shape));
    }
  }, []);

  const updateShape = useMutation(({ storage }, id: string, patch: Partial<Shape>) => {
    const list = storage.get('shapes');
    for (let i = 0; i < list.length; i++) {
      const item = list.get(i);
      if (item?.get('id') === id) {
        (Object.entries(patch) as [keyof Shape, unknown][]).forEach(([k, v]) => {
          item.set(k, v as never);
        });
        break;
      }
    }
  }, []);

  const deleteShape = useMutation(({ storage }, id: string) => {
    const list = storage.get('shapes');
    for (let i = 0; i < list.length; i++) {
      if (list.get(i)?.get('id') === id) { list.delete(i); break; }
    }
  }, []);

  const selectedShape = shapes.find((s) => s.id === selectedId) ?? null;
  const { copySelected, pasteClipboard, duplicateSelected } = useShapeClipboard({
    shapes,
    selectedId,
    setSelectedId,
    onAddShape: addShape,
  });
  const zoomPercent = Math.round(viewport.zoom * 100);

  const getDrawBounds = () => {
    const pad = 48;
    const minX = (-viewport.x + pad) / viewport.zoom;
    const minY = (-viewport.y + pad) / viewport.zoom;
    const maxX = (-viewport.x + wrapperSize.w - pad) / viewport.zoom;
    const maxY = (-viewport.y + wrapperSize.h - pad) / viewport.zoom;
    return { minX, minY, maxX, maxY };
  };

  const handleAiShapes = (newShapes: Shape[]) => {
    addShapes(newShapes);
  };

  return (
    <div className="room-layout">
      {/* Header */}
      <header className="room-header">
        <div className="room-title">
          <span className="logo-mark">✦</span>
          <span className="room-name">{roomId}</span>
        </div>
        <div className="room-header-right">
          <div className="room-header-buttons">
            <ThemeToggle />
            <ExportMenu shapes={shapes} selectedId={selectedId} roomId={roomId} />
            <InviteButton roomId={roomId} />
            <button
              type="button"
              className={`header-action-btn cursors-toggle-btn ${showOthersCursors ? 'active' : ''}`}
              onClick={toggleOthersCursors}
              aria-pressed={showOthersCursors}
              title={
                showOthersCursors
                  ? 'Hide others\' cursors (show only yours)'
                  : 'Show everyone\'s live cursors'
              }
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 4l6 16 2.5-7.5L20 10 4 4z" strokeLinejoin="round" />
              </svg>
              <span className="btn-label">Cursors</span>
            </button>
            <button
              type="button"
              className={`header-action-btn ai-toggle-btn ${aiOpen ? 'active' : ''}`}
              onClick={() => setAiOpen((o) => !o)}
              aria-pressed={aiOpen}
              title="AI draw on canvas"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" strokeLinejoin="round" />
                <path d="M5 19l1 2 2 1-2 1-1 2-1-2-2-1 1-2z" strokeLinejoin="round" />
              </svg>
              <span className="btn-label">AI</span>
            </button>
            <button
              type="button"
              className={`header-action-btn chat-toggle-btn ${chatOpen ? 'active' : ''} ${chatHasUnread ? 'has-chat-unread' : ''}`}
              onClick={() => setChatOpen((o) => !o)}
              aria-pressed={chatOpen}
              title={chatHasUnread ? 'Room chat — new messages' : 'Room chat'}
              aria-label={chatHasUnread ? 'Room chat, unread messages' : 'Room chat'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="btn-label">Chat</span>
              {chatHasUnread && !chatOpen && (
                <span className="chat-unread-dot" aria-hidden />
              )}
            </button>
          </div>
          <span className="room-header-divider" aria-hidden />
          <Presence />
        </div>
      </header>

      <div className="editor-body">
        <div className="editor-tools-column">
          <Toolbar tool={tool} onToolChange={setTool} />
          <PresentationBar mode={presentationPointer} onModeChange={setPresentationPointer} />
        </div>

        <div
          ref={wrapperRef}
          className={`canvas-wrapper${presentationPointer === 'laser' ? ' canvas-wrapper--laser' : ''}`}
        >
          <CanvasCore
            shapes={shapes}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onAddShape={addShape}
            onUpdateShape={updateShape}
            onDeleteShape={deleteShape}
            onCopy={copySelected}
            onPaste={pasteClipboard}
            onDuplicate={duplicateSelected}
            viewport={viewport}
            setViewport={setViewport}
            tool={tool}
            setTool={setTool}
            style={style}
            setStyle={(patch) => setStyle((s) => ({ ...s, ...patch }))}
          />
          <AppleLaserLayer viewport={viewport} width={wrapperSize.w} height={wrapperSize.h} />
          <LiveCursors
            viewport={viewport}
            width={wrapperSize.w}
            height={wrapperSize.h}
            showOthers={showOthersCursors}
          />

          {/* Zoom controls */}
          <div className="zoom-indicator">
            <button onClick={() => setViewport((v) => ({ ...v, zoom: Math.min(v.zoom * 1.25, 20) }))}>+</button>
            <span>{zoomPercent}%</span>
            <button onClick={() => setViewport((v) => ({ ...v, zoom: Math.max(v.zoom / 1.25, 0.05) }))}>−</button>
            <button onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })} title="Reset view">↺</button>
          </div>
        </div>

        {/* Right properties panel */}
        <PropertiesPanel
          style={style}
          onChange={(patch) => setStyle((s) => ({ ...s, ...patch }))}
          selectedShape={selectedShape}
          onShapeChange={selectedShape ? (patch) => updateShape(selectedShape.id, patch) : undefined}
        />
      </div>

      <div className="room-side-dock">
        <RoomAI
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          onShapesGenerated={handleAiShapes}
          getDrawBounds={getDrawBounds}
        />
        <RoomChat open={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </div>
  );
}
