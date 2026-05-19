"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import Link from "next/link";
import { renderCanvas } from "@/components/ui/canvas";
import { DIcons } from "dicons";
import { Button } from "@/components/ui/button";

export function Hero() {
  useEffect(() => {
    const cleanup = renderCanvas();
    return cleanup;
  }, []);

  return (
    <section id="home" className="relative min-h-[85vh] overflow-hidden pb-16 pt-28 md:pt-32">
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_2px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_2px)]",
        )}
      />

      <canvas
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-90"
        id="canvas"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 text-center">
        <div className="relative mx-auto mt-4 w-full max-w-5xl border border-border p-6 md:px-12 md:py-16">
          <DIcons.Plus strokeWidth={4} className="absolute -left-4 -top-4 h-8 w-8 text-brand md:h-10 md:w-10" />
          <DIcons.Plus strokeWidth={4} className="absolute -bottom-4 -left-4 h-8 w-8 text-brand md:h-10 md:w-10" />
          <DIcons.Plus strokeWidth={4} className="absolute -right-4 -top-4 h-8 w-8 text-brand md:h-10 md:w-10" />
          <DIcons.Plus strokeWidth={4} className="absolute -right-4 -bottom-4 h-8 w-8 text-brand md:h-10 md:w-10" />

          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Build faster with SheetSketch
          </h1>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/get-started">
              <Button
                size="lg"
                className="h-12 gap-2.5 rounded-full border border-violet-500/35 bg-violet-950/70 px-8 text-sm font-bold uppercase tracking-[0.12em] text-violet-100 shadow-[0_0_28px_rgba(124,58,237,0.22)] hover:border-violet-400/50 hover:bg-violet-900/80 dark:bg-violet-950/50"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="cta-live-dot relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Sketch, brainstorm, and co-create with your team in password-protected rooms.
        </p>
      </div>
    </section>
  );
}
