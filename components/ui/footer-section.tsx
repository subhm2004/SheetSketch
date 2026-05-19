"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ThemeToggle"
import { ArrowRight, Send } from "lucide-react"
import Link from "next/link"
import { SmoothScrollLink } from "@/components/ui/smooth-scroll-link"

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "How to use", href: "#how-to-use" },
  { label: "Discover", href: "#discover" },
  { label: "Testimonials", href: "#testimonials" },
]

function Footerdemo() {
  return (
    <footer className="relative border-t border-border/60 bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_0%,rgba(0,0,0,0.04),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_20%_0%,rgba(255,255,255,0.04),transparent_50%)]" />

      <div className="container relative mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-20">
          {/* Stay Connected */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Newsletter
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Stay Connected
              </h2>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                Collaborate on exciting projects — get updates when we ship something new.
              </p>
            </div>

            <form
              className="flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:items-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 rounded-xl border-border/80 bg-muted/40 pr-4 text-base shadow-sm backdrop-blur-sm transition focus-visible:border-foreground/30 focus-visible:ring-foreground/15 dark:bg-muted/20"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 shrink-0 gap-2 rounded-xl border border-neutral-200 bg-neutral-900 px-6 font-semibold text-white shadow-sm transition hover:bg-neutral-800 dark:border-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                Subscribe
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="lg:justify-self-end">
            <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm dark:bg-card/20 md:p-8 lg:min-w-[240px]">
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                Quick Links
              </h3>
              <nav className="mt-5 flex flex-col gap-1">
                {quickLinks.map(({ label, href }) => (
                  <SmoothScrollLink
                    key={label}
                    href={href}
                    className="group flex items-center justify-between rounded-lg py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
                  >
                    <span>{label}</span>
                    <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                  </SmoothScrollLink>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-border/60 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 Shubham Malik. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <ThemeToggle />
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <a href="#" className="transition-colors hover:text-foreground">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                Terms of Service
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                Cookie Settings
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
