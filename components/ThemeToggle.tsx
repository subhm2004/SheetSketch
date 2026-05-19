'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

const MODES = [
  { value: 'light' as const, label: 'Light mode', icon: Sun },
  { value: 'dark' as const, label: 'Dark mode', icon: Moon },
];

export function ThemeToggle({ className }: Props) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'theme-toggle h-9 w-[4.5rem] animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800',
          className,
        )}
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        'theme-toggle inline-flex items-center gap-0.5 rounded-full p-1',
        'border border-neutral-200 bg-neutral-100/90 shadow-sm',
        'dark:border-neutral-700/80 dark:bg-neutral-800/90',
        className,
      )}
    >
      {MODES.map(({ value, label, icon: Icon }) => {
        const isActive = value === 'dark' ? isDark : !isDark;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            title={label}
            aria-label={label}
            aria-pressed={isActive}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200',
              isActive
                ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/90 dark:bg-violet-600 dark:text-white dark:shadow-md dark:shadow-violet-600/35 dark:ring-0'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200',
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        );
      })}
    </div>
  );
}
