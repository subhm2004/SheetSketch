"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu as MenuIcon, X, Github } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteConfig } from "@/lib/site-config";
import { SheetSketchLogo } from "@/components/brand/SheetSketchLogo";
import { isHashHref, smoothScrollToHash } from "@/lib/smooth-scroll";

const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-7xl items-center justify-between rounded-full border border-black/[0.08] bg-white/80 px-6 py-3.5 shadow-[0_8px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/[0.12] dark:bg-black/70 dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] sm:px-8 sm:py-4"
    >
      {/* LEFT: LOGO */}
      <Link href="/" className="group flex shrink-0 items-center gap-2.5">
        <SheetSketchLogo
          size={36}
          className="transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3"
        />
        <span className="text-md font-bold text-black dark:text-white">SheetSketch</span>
      </Link>

      {/* CENTER: DESKTOP NAV */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
        <div className="pointer-events-auto flex items-center space-x-6">
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, { onNavigate: () => setIsOpen(false) } as { onNavigate?: () => void })
              : child,
          )}
        </div>
      </div>

      {/* RIGHT: GITHUB + THEME + CTA + MOBILE */}
      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href={siteConfig.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          title="GitHub"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/[0.08] bg-black/[0.04] text-black transition-colors hover:bg-black/[0.08] dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
        >
          <Github className="h-5 w-5" strokeWidth={2} />
        </a>
        <ThemeToggle className="hidden sm:flex shrink-0" />
        <div className="hidden sm:block">
          <Link href="/get-started">
            <Button
              variant="default"
              className="gap-2 rounded-full border border-violet-500/35 bg-violet-950/80 px-6 text-violet-100 hover:bg-violet-900/90 dark:bg-violet-950/60 dark:text-violet-100"
            >
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="cta-live-dot relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Get Started
            </Button>
          </Link>
        </div>
      

        {/* Hamburger Icon - Only Mobile */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-black dark:text-white"
        >
          {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-3 p-4 bg-white dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-3xl shadow-xl md:hidden flex flex-col gap-4 z-50"
          >
            <div className="flex flex-col items-start gap-4 px-4 py-2">
              {React.Children.map(children, (child) =>
                React.isValidElement(child)
                  ? React.cloneElement(child, { onNavigate: () => setIsOpen(false) } as { onNavigate?: () => void })
                  : child,
              )}
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-2 flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Link href="/get-started" className="w-full px-2 pb-2">
              <Button className="w-full rounded-xl">Get Started</Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
  href,
  onNavigate,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
  href?: string;
  onNavigate?: () => void;
}) => {
  const hashLink = isHashHref(href);

  const handleNavClick = (e: React.MouseEvent) => {
    if (hashLink && href) {
      e.preventDefault();
      smoothScrollToHash(href);
      onNavigate?.();
      return;
    }
    setActive(item);
  };

  return (
    <div 
      onMouseEnter={() => setActive(item)} 
      onClick={hashLink ? undefined : () => setActive(item)}
      className="relative"
    >
     {href ? (
        hashLink ? (
          <a href={href} onClick={handleNavClick}>
            <motion.p
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer font-light text-black hover:opacity-[0.9] dark:text-white"
            >
              {item}
            </motion.p>
          </a>
        ) : (
        <Link href={href}>
          <motion.p
            transition={{ duration: 0.3 }}
            className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white font-light"
          >
            {item}
          </motion.p>
        </Link>
        )
      ) : (
        <motion.p
          transition={{ duration: 0.3 }}
          className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white font-medium"
        >
          {item}
        </motion.p>
      )}
      {active === item && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
          className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 md:pt-4 z-[100]"
        >
          <div className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl">
            <div className="w-max h-full p-4">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};


export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <a
      {...rest}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black "
    >
      {children}
    </a>
  );
};
