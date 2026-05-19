'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Lock, User } from 'lucide-react';
import { getOrCreateGuestId } from '@/lib/guest-id';
const COLORS = [
  '#e03131', '#c2255c', '#9c36b5', '#6741d9', '#3b5bdb',
  '#1971c2', '#0c8599', '#099268', '#2f9e44', '#e8590c',
];

export default function InviteClient({ token }: { token: string }) {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/invite/${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Invalid invite link');
          return;
        }
        setRoomId(data.roomId);
      })
      .catch(() => setError('Could not load invite'))
      .finally(() => setFetching(false));
  }, [token]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/invite/${encodeURIComponent(token)}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not join');
        return;
      }

      sessionStorage.setItem('room_token', data.token);
      sessionStorage.setItem('room_name', name || 'Anonymous');
      sessionStorage.setItem(
        'room_color',
        COLORS[Math.floor(Math.random() * COLORS.length)],
      );
      getOrCreateGuestId();
      router.push(`/room/${encodeURIComponent(data.roomId)}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const shell = (children: React.ReactNode) => (
    <div className="get-started-page relative min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-[120px] dark:bg-violet-600/25" />
        <div className="absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-indigo-500/15 blur-[100px] dark:bg-indigo-600/20" />
      </div>
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-md transition hover:border-violet-500/30 hover:bg-card hover:text-foreground sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>
      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center p-4">
        {children}
      </div>
    </div>
  );

  if (fetching) {
    return shell(
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500 dark:text-violet-400" />
        <p className="text-sm font-medium">Loading invite…</p>
      </div>,
    );
  }

  if (error && !roomId) {
    return shell(
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/80 p-8 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-lg font-semibold text-foreground">Invalid invite</p>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white"
        >
          Go home
        </Link>
      </div>,
    );
  }

  return shell(
    <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          You&apos;re invited
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Join the room</h1>
        <p className="mt-1 font-mono text-sm text-violet-600 dark:text-violet-300">{roomId}</p>
      </div>

      <form onSubmit={handleJoin} className="space-y-4">
        <InviteField
          id="name"
          label="Your name"
          icon={<User className="h-4 w-4" />}
          value={name}
          onChange={setName}
          placeholder="e.g. Alice"
          required
        />
        <InviteField
          id="password"
          label="Room password"
          icon={<Lock className="h-4 w-4" />}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter room password"
          required
          minLength={4}
        />
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Join room
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </>
          )}
        </button>
      </form>
    </div>,
  );
}

function InviteField({
  id,
  label,
  icon,
  value,
  onChange,
  type = 'text',
  ...rest
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
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
          className="w-full rounded-xl border border-border/60 bg-muted/30 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-600"
          {...rest}
        />
      </div>
    </div>
  );
}
