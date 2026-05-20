'use client';

import { cn } from '@/lib/utils';
import type { PresentationPointer } from '@/lib/types';

type Props = {
  mode: PresentationPointer;
  onModeChange: (mode: PresentationPointer) => void;
};

export default function PresentationBar({ mode, onModeChange }: Props) {
  const laserOn = mode === 'laser';

  return (
    <button
      type="button"
      className={cn('tool-btn presentation-laser-btn', laserOn && 'active')}
      aria-pressed={laserOn}
      title="Laser pointer (K)"
      onClick={() => onModeChange(laserOn ? 'off' : 'laser')}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
      </svg>
      <span className="tool-key">K</span>
    </button>
  );
}
