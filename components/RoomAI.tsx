'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type { Shape } from '@/lib/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onShapesGenerated: (shapes: Shape[], message?: string) => void;
  getDrawBounds: () => { minX: number; minY: number; maxX: number; maxY: number };
};

const EXAMPLES = [
  'Draw a simple house',
  'Flowchart: Start → Process → End',
  'Smiley face with circle and eyes',
  'Website wireframe boxes',
];

export default function RoomAI({ open, onClose, onShapesGenerated, getDrawBounds }: Props) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastNote, setLastNote] = useState<string | null>(null);

  const handleDraw = async (text?: string) => {
    const value = (text ?? prompt).trim();
    if (!value || loading) return;

    setLoading(true);
    setError(null);
    setLastNote(null);

    try {
      const res = await fetch('/api/ai-draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: value,
          bounds: getDrawBounds(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Could not generate drawing');
      }

      const note = [data.message, data.provider === 'groq' ? 'Powered by Groq' : null]
        .filter(Boolean)
        .join(' · ');
      onShapesGenerated(data.shapes as Shape[], note || undefined);
      if (note) setLastNote(note);
      if (text) setPrompt(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <aside className="room-ai" aria-label="AI draw assistant">
      <header className="room-ai-header">
        <div className="room-ai-title">
          <Sparkles className="h-4 w-4 text-violet-500" aria-hidden />
          <h2>AI Draw</h2>
        </div>
        <button type="button" className="room-ai-close" onClick={onClose} aria-label="Close AI panel">
          ×
        </button>
      </header>

      <div className="room-ai-body">
        <p className="room-ai-hint">
          Describe what to draw on the canvas — shapes will appear for everyone in the room.
        </p>

        {lastNote && <p className="room-ai-note">{lastNote}</p>}
        {error && <p className="room-ai-error">{error}</p>}

        <div className="room-ai-examples">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              className="room-ai-chip"
              disabled={loading}
              onClick={() => handleDraw(ex)}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <form
        className="room-ai-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleDraw();
        }}
      >
        <textarea
          className="room-ai-input"
          placeholder='e.g. "Draw a star and label it Hello"'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          maxLength={800}
          disabled={loading}
        />
        <button type="submit" className="room-ai-submit" disabled={!prompt.trim() || loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Drawing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden />
              Draw on canvas
            </>
          )}
        </button>
      </form>
    </aside>
  );
}
