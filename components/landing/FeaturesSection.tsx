'use client';

import { motion } from 'motion/react';
import {
  MousePointer2,
  Pencil,
  Lock,
  Link2,
  MessageSquare,
  Sparkles,
  Maximize2,
  Undo2,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Pencil,
    title: 'Hand-drawn canvas',
    description:
      'Rectangles, arrows, freehand, and text with Rough.js — sketches that feel human, not sterile.',
    accent: 'from-orange-500/20 to-amber-500/5',
    iconClass: 'text-orange-500 dark:text-orange-400',
  },
  {
    icon: MousePointer2,
    title: 'Live cursors',
    description:
      'See teammates move in real time. Colored cursors and names so you always know who is where.',
    accent: 'from-violet-500/20 to-indigo-500/5',
    iconClass: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: Lock,
    title: 'Password rooms',
    description:
      'Create a room ID and password. Only people with access join your private whiteboard.',
    accent: 'from-emerald-500/20 to-teal-500/5',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Link2,
    title: 'Invite links',
    description:
      'Share a guest link — teammates join with just their name. No password needed for invitees.',
    accent: 'from-sky-500/20 to-cyan-500/5',
    iconClass: 'text-sky-600 dark:text-sky-400',
  },
  {
    icon: MessageSquare,
    title: 'Room chat',
    description:
      'Chat beside the canvas without switching apps. Unread dot when new messages arrive.',
    accent: 'from-blue-500/20 to-indigo-500/5',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Sparkles,
    title: 'AI draw',
    description:
      'Describe a flowchart or wireframe in words — AI places shapes on your visible canvas.',
    accent: 'from-fuchsia-500/20 to-pink-500/5',
    iconClass: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
  {
    icon: Maximize2,
    title: 'Infinite space',
    description: 'Pan and zoom without limits. Wireframes, diagrams, and brainstorms stay crisp.',
    accent: 'from-neutral-500/15 to-neutral-500/5',
    iconClass: 'text-neutral-700 dark:text-neutral-300',
  },
  {
    icon: Undo2,
    title: 'Undo & redo',
    description: 'Collaborative history so everyone can step back and forward through changes.',
    accent: 'from-rose-500/15 to-orange-500/5',
    iconClass: 'text-rose-600 dark:text-rose-400',
  },
];

const HIGHLIGHTS = [
  { icon: Zap, label: 'Sub-50ms sync' },
  { icon: Users, label: 'Multiplayer' },
  { icon: Lock, label: 'Secure rooms' },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden py-20 lg:py-28">
      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[min(100%,48rem)] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[100px] dark:bg-violet-600/15"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Features
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-orange-300">
              sketch together
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            SheetSketch packs real-time collaboration, secure rooms, chat, and AI into one
            lightweight whiteboard — no installs, no friction.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
  iconClass,
  index,
}: (typeof FEATURES)[number] & { index: number }) {
  return (
    <motion.article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-6',
        'shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md',
        'dark:border-white/10 dark:bg-card/40',
      )}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          accent,
        )}
      />
      <div className="relative">
        <div
          className={cn(
            'mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background/80 shadow-sm',
            iconClass,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.article>
  );
}
