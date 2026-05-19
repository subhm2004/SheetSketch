const DEFAULT_OFFSET = 96;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Smooth scroll to an on-page section (navbar offset included). */
export function smoothScrollToHash(hash: string, offset = DEFAULT_OFFSET): void {
  if (typeof window === 'undefined') return;

  const id = hash.replace(/^#/, '');
  if (!id) return;

  const el = document.getElementById(id);
  if (!el) return;

  const targetY = el.getBoundingClientRect().top + window.scrollY - offset;
  const startY = window.scrollY;
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    window.scrollTo({ top: targetY, behavior: 'auto' });
    return;
  }

  const duration = Math.min(1000, Math.max(550, Math.abs(distance) * 0.45));
  let startTime: number | null = null;

  function step(now: number) {
    if (startTime === null) startTime = now;
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

export function isHashHref(href?: string): href is string {
  return typeof href === 'string' && href.startsWith('#');
}
