'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import {
  ArrowRight,
  Link2,
  MessageSquare,
  MousePointer2,
  Pencil,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create a room',
    description:
      'Click Get Started, pick a room ID (e.g. my-team) and a password. Your private whiteboard is ready in seconds — no signup required.',
    accent: 'from-violet-500/25 to-indigo-500/5',
    iconClass: 'text-violet-600 dark:text-violet-400',
  },
  {
    step: '02',
    icon: Link2,
    title: 'Invite your team',
    description:
      'Share the invite link from inside the room. Teammates join with just their name. Others can also join with the same room ID + password.',
    accent: 'from-sky-500/20 to-cyan-500/5',
    iconClass: 'text-sky-600 dark:text-sky-400',
  },
  {
    step: '03',
    icon: Pencil,
    title: 'Sketch together',
    description:
      'Draw shapes, arrows, and freehand lines. Pan and zoom on an infinite canvas. Everyone sees live cursors and edits in real time.',
    accent: 'from-orange-500/20 to-amber-500/5',
    iconClass: 'text-orange-500 dark:text-orange-400',
  },
  {
    step: '04',
    icon: MessageSquare,
    title: 'Chat & use AI',
    description:
      'Open room chat beside the canvas. Use AI Draw to describe a diagram in words — flowcharts and wireframes appear on your board.',
    accent: 'from-fuchsia-500/20 to-pink-500/5',
    iconClass: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
];

const TIPS = [
  { icon: MousePointer2, text: 'Select tool → click shapes to move or resize' },
  { icon: Sparkles, text: 'AI Draw works best with clear prompts (e.g. “login flowchart”)' },
];

export function HowToUseSection() {
  return (
    <section id="how-to-use" className="relative overflow-hidden border-y border-border/50 bg-muted/30 py-20 lg:py-28 dark:bg-muted/10">
      <motion.div
        className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[100px] dark:bg-orange-600/15"
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
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How to use
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Start sketching in{' '}
            <span className="bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-orange-300">
              four simple steps
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            SheetSketch runs in your browser. Create a room, invite people, and collaborate — no
            installs or accounts.
          </p>
        </motion.div>

        <div className="relative mt-14">
          {/* connector line — desktop */}
          <motion.div
            className="pointer-events-none absolute left-0 right-0 top-[4.5rem] hidden h-0.5 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent lg:block"
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {STEPS.map((item, i) => (
              <StepCard key={item.step} {...item} index={i} />
            ))}
          </div>
        </div>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {TIPS.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex max-w-md items-center gap-2 rounded-full border border-border/80 bg-background/70 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm sm:text-sm"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
              {text}
            </span>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <Link href="/get-started">
            <Button
              size="lg"
              className="group gap-2 rounded-full bg-foreground px-8 text-background hover:bg-foreground/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              Create your first room
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  description,
  accent,
  iconClass,
  index,
}: (typeof STEPS)[number] & { index: number }) {
  return (
    <motion.article
      className={cn(
        'relative flex flex-col rounded-2xl border border-border/80 bg-card/80 p-6 backdrop-blur-sm',
        'dark:border-white/10 dark:bg-card/50',
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
    >
      <motion.div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br opacity-60',
          accent,
        )}
        aria-hidden
      />
      <div className="relative flex flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-bold tabular-nums tracking-widest text-muted-foreground">
            {step}
          </span>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/90 shadow-sm',
              iconClass,
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.article>
  );
}
