'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, Lock, Users, Zap, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Discover() {
  const features = [
    {
      title: 'One canvas, unlimited space',
      description:
        'Pan and zoom forever. Wireframes, diagrams, and sketches stay crisp while your team works together in real time.',
      skeleton: <WorkspaceShowcase />,
      accent: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
      className: 'col-span-1 lg:col-span-4 border-b lg:border-r border-white/10',
    },
    {
      title: 'Live cursors & room chat',
      description: "See who's drawing where and talk without leaving the board.",
      skeleton: <CollabShowcase />,
      accent: 'from-cyan-500/20 via-sky-500/10 to-transparent',
      className: 'col-span-1 lg:col-span-2 border-white/10',
    },
  ];

  return (
    <section id="discover" className="discover-section relative z-20 overflow-hidden py-16 lg:py-28">
      <motion.div
        className="discover-glow discover-glow--left pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-violet-600/25 blur-[100px]"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="discover-glow discover-glow--right pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-[90px]"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            Built for teams
          </span>
          <h2 className="mx-auto max-w-4xl text-3xl font-semibold tracking-tight text-white lg:text-5xl lg:leading-tight">
            Discover &{' '}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
              collaborate
            </span>{' '}
            at the speed of thought
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-400">
            Everything you need to visualize ideas with your team — live, colorful, and instant.
          </p>
        </motion.div>

        <motion.div
          className="relative mt-14"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.08 }}
        >
          <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/80 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_40px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:grid-cols-6">
            {features.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                className={feature.className}
                accent={feature.accent}
                delay={i * 0.1}
              >
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
                <div className="mt-5 min-h-[300px] flex-1">{feature.skeleton}</div>
              </FeatureCard>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({
  children,
  className,
  accent,
  delay = 0,
}: {
  children?: React.ReactNode;
  className?: string;
  accent: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn('group relative flex min-h-[520px] flex-col overflow-hidden p-6 sm:p-8', className)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.45 }}
    >
      <motion.div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
          accent,
        )}
      />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </motion.div>
  );
}

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => (
  <h3 className="text-xl font-semibold tracking-tight text-white md:text-2xl">{children}</h3>
);

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => (
  <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-400 md:text-base">{children}</p>
);

function WorkspaceShowcase() {
  return (
    <div className="discover-showcase relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-2xl">
      <div className="discover-showcase-border pointer-events-none absolute inset-0 rounded-2xl" />

      <motion.div
        className="relative flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.6)]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.5)]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.5)]" />
        <span className="ml-2 flex-1 truncate rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-violet-200/90">
          sheetsketch.app/room/product-sync
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="cta-live-dot relative h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live
        </span>
      </motion.div>

      <div className="relative flex-1 overflow-hidden bg-[#12121a] p-4">
        <div
          className="absolute inset-4 rounded-xl opacity-60"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.35) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <motion.div
          className="absolute left-[8%] top-[14%] h-[72px] w-[100px] rotate-[-3deg] rounded-xl border-2 border-violet-400 bg-violet-500/25 shadow-[0_0_30px_rgba(139,92,246,0.35)]"
          animate={{ y: [0, -8, 0], rotate: [-3, 1, -3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[10%] top-[18%] h-14 w-14 rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_24px_rgba(251,191,36,0.4)]"
          animate={{ y: [0, 10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <motion.div
          className="absolute left-[28%] top-[38%] h-12 w-20 rotate-[6deg] rounded-md border-2 border-cyan-400 bg-cyan-400/15 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.svg
          className="absolute bottom-[32%] left-[18%] w-36 text-fuchsia-400 drop-shadow-[0_0_12px_rgba(232,121,249,0.6)]"
          viewBox="0 0 120 40"
          fill="none"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <motion.path
            d="M8 32 C 40 8, 72 8, 108 28"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          />
          <path
            d="M96 28 L108 28 L104 20"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>

        <motion.div
          className="absolute bottom-[20%] right-[8%] max-w-[150px] rounded-2xl border border-fuchsia-500/30 bg-fuchsia-950/80 px-3 py-2.5 text-[11px] font-medium leading-snug text-fuchsia-100 shadow-[0_8px_32px_rgba(192,38,211,0.25)] backdrop-blur-sm"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✦ Ship the onboarding flow first
        </motion.div>

        <LiveCursor name="Priya" color="#818cf8" bg="bg-indigo-500" path={{ x: [0, 28, 12, 0], y: [0, 18, 36, 0] }} duration={8} className="left-[36%] top-[40%]" />
        <LiveCursor name="Alex" color="#fb7185" bg="bg-rose-500" path={{ x: [0, -22, -6, 0], y: [0, -14, 10, 0] }} duration={7} delay={0.4} className="right-[20%] top-[48%]" />
        <LiveCursor name="Sam" color="#34d399" bg="bg-emerald-500" path={{ x: [0, 14, -8, 0], y: [0, 22, 8, 0] }} duration={9} delay={0.8} className="left-[58%] top-[22%]" />

        <motion.div
          className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Pill icon={Zap} label="Real-time sync" color="violet" />
          <Pill icon={Lock} label="Password rooms" color="amber" />
          <Pill icon={Users} label="Live presence" color="cyan" />
        </motion.div>
      </div>
    </div>
  );
}

function LiveCursor({
  name,
  color,
  bg,
  path,
  duration,
  delay = 0,
  className,
}: {
  name: string;
  color: string;
  bg: string;
  path: { x: number[]; y: number[] };
  duration: number;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={cn('absolute z-30 flex flex-col items-start gap-1', className)}
      animate={path}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <span
        className="rounded-full p-1 shadow-lg"
        style={{ boxShadow: `0 0 16px ${color}88` }}
      >
        <CursorIcon color={color} size={16} />
      </span>
      <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md', bg)}>
        {name}
      </span>
    </motion.div>
  );
}

function Pill({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: 'violet' | 'amber' | 'cyan';
}) {
  const styles = {
    violet: 'border-violet-500/40 bg-violet-500/15 text-violet-200',
    amber: 'border-amber-500/40 bg-amber-500/15 text-amber-200',
    cyan: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200',
  };
  return (
    <motion.span
      whileHover={{ scale: 1.04, y: -1 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold backdrop-blur-md',
        styles[color],
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {label}
    </motion.span>
  );
}

function CollabShowcase() {
  return (
    <div className="discover-showcase relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-2xl">
      <div className="discover-showcase-border pointer-events-none absolute inset-0 rounded-2xl" />

      <div className="relative flex-1 overflow-hidden bg-[#0d0d14] p-4">
        <div
          className="absolute inset-3 rounded-xl"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(56,189,248,0.25) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-cyan-950/40 via-transparent to-violet-950/20"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <div className="absolute top-3 right-3 z-50 flex flex-col items-end gap-2.5">
          <motion.div
            initial={{ x: 24, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex max-w-[160px] items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-950/90 px-3 py-2 shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-md"
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <span className="text-[10px] font-medium text-blue-100">Should we use this layout?</span>
          </motion.div>
          <motion.div
            initial={{ x: 24, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2 }}
            className="flex max-w-[140px] items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/90 px-3 py-2 shadow-[0_0_20px_rgba(52,211,153,0.2)] backdrop-blur-md"
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span className="text-[10px] font-medium text-emerald-100">Yes — ship it! 🚀</span>
          </motion.div>
        </div>

        <LiveCursor name="Alex" color="#60a5fa" bg="bg-blue-500" path={{ x: [16, 90, 50, 16], y: [70, 120, 90, 70] }} duration={5} className="left-0 top-0" />
        <LiveCursor name="Sarah" color="#f87171" bg="bg-red-500" path={{ x: [180, 120, 160, 180], y: [30, 80, 50, 30] }} duration={6.5} delay={0.5} className="left-0 top-0" />

        <motion.div
          className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-violet-400"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </span>
            <span className="text-[10px] text-neutral-400">Someone is typing…</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const CursorIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M5.6691 12.3174L2.8851 3.7928C2.51501 2.65715 3.65715 1.51501 4.7928 1.8851L13.3174 4.6691C14.4551 5.04017 14.4714 6.64336 13.3424 7.03741L8.9631 8.5641L7.43641 12.9434C7.04236 14.0724 5.43917 14.0561 5.6691 12.3174Z"
      fill={color}
    />
  </svg>
);
