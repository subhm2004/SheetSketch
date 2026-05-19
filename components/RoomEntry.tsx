'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Lock, User, Hash } from 'lucide-react';
import { SheetSketchLogo } from '@/components/brand/SheetSketchLogo';
import { getOrCreateGuestId } from '@/lib/guest-id';
import { cn } from '@/lib/utils';

type Props = { embedded?: boolean };

export default function RoomEntry({ embedded = false }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url =
        tab === 'create'
          ? '/api/rooms'
          : `/api/rooms/${encodeURIComponent(roomId)}/join`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }

      sessionStorage.setItem('room_token', data.token);
      sessionStorage.setItem('room_name', name || 'Anonymous');
      sessionStorage.setItem('room_color', randomColor());
      getOrCreateGuestId();
      router.push(`/room/${encodeURIComponent(roomId)}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const card = (
    <div
      className={cn(
        'w-full rounded-2xl border border-border/50 bg-card/80 p-6 shadow-2xl shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 sm:p-8',
        embedded ? 'max-w-md' : 'max-w-[440px]',
      )}
    >
      {!embedded && (
        <div className="mb-8 text-center">
          <SheetSketchLogo size={56} className="mx-auto mb-4 shadow-lg shadow-violet-500/30" />
          <h1 className="font-[family-name:var(--font-caveat)] text-4xl font-bold tracking-tight text-white">
            SheetSketch
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Collaborative drawing, hand-crafted feel
          </p>
        </div>
      )}

      <div className="mb-6 flex rounded-xl bg-muted/50 p-1 ring-1 ring-border/60 dark:bg-white/5 dark:ring-white/10">
        {(['create', 'join'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setTab(mode)}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200',
              tab === mode
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30 dark:shadow-violet-900/40'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {mode === 'create' ? 'Create room' : 'Join room'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          id="name"
          label="Your name"
          icon={<User className="h-4 w-4" />}
          placeholder="e.g. Alice"
          value={name}
          onChange={setName}
          required
        />
        <Field
          id="roomId"
          label="Room ID"
          icon={<Hash className="h-4 w-4" />}
          placeholder="e.g. my-canvas-42"
          value={roomId}
          onChange={(v) => setRoomId(v.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          required
          minLength={3}
          maxLength={32}
          hint="3–32 chars: letters, numbers, hyphens"
        />
        <Field
          id="password"
          label="Password"
          icon={<Lock className="h-4 w-4" />}
          type="password"
          placeholder="Room password"
          value={password}
          onChange={setPassword}
          required
          minLength={4}
        />

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/30 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {tab === 'create' ? 'Create & enter' : 'Join room'}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  if (embedded) return card;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4">
      {card}
    </div>
  );
}

function Field({
  id,
  label,
  icon,
  hint,
  value,
  onChange,
  type = 'text',
  ...rest
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className="w-full rounded-xl border border-border/60 bg-muted/30 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-violet-500/50 focus:bg-background focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-600 dark:focus:bg-white/[0.07]"
          {...rest}
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function randomColor() {
  const colors = [
    '#e03131', '#c2255c', '#9c36b5', '#6741d9', '#3b5bdb',
    '#1971c2', '#0c8599', '#099268', '#2f9e44', '#e8590c',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
