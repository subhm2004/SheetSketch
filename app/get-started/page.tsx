import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Layers, Link2, Users, Zap } from 'lucide-react';
import RoomEntry from '@/components/RoomEntry';
import { GetStartedThemeToggle } from '@/components/GetStartedThemeToggle';

export const metadata: Metadata = {
  title: 'Get Started — SheetSketch',
  description: 'Create or join a collaborative drawing room.',
};

const perks = [
  { icon: Zap, text: 'Real-time cursors & drawing sync' },
  { icon: Users, text: 'Password-protected team rooms' },
  { icon: Link2, text: 'Shareable invite links' },
  { icon: Layers, text: 'Hand-drawn canvas feel' },
];

export default function GetStartedPage() {
  return (
    <div className="get-started-page relative min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-[120px] dark:bg-violet-600/30" />
        <div className="absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-indigo-500/15 blur-[100px] dark:bg-indigo-600/25" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[90px] dark:bg-fuchsia-600/15" />
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <GetStartedThemeToggle />
      </div>

      <Link
        href="/"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-md transition hover:border-violet-500/30 hover:bg-card hover:text-foreground sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-4 py-24 sm:px-8 lg:flex-row lg:items-center lg:gap-16 lg:py-16">
        <div className="mb-10 max-w-lg lg:mb-0 lg:flex-1">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500 dark:bg-violet-400" />
            Get started
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Open a room.
            <span className="block bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-violet-300 dark:via-indigo-300 dark:to-fuchsia-300">
              Draw together.
            </span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Create a canvas in seconds, pick a room ID and password, then invite your team with one link.
          </p>
          <ul className="mt-8 space-y-3">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-foreground/80">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20 dark:bg-white/5 dark:ring-white/10">
                  <Icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full lg:w-[440px] lg:shrink-0">
          <RoomEntry embedded />
        </div>
      </div>
    </div>
  );
}
