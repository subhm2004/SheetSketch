import { cn } from '@/lib/utils';

type SheetSketchLogoProps = {
  size?: number;
  className?: string;
};

/** SheetSketch brand mark — sketch frame + pen + collab dot */
export function SheetSketchLogo({ size = 32, className }: SheetSketchLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="ss-bg" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="0.55" stopColor="#A855F7" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
        <linearGradient id="ss-pen" x1="20" y1="18" x2="27" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FDE68A" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#ss-bg)" />
      {/* Hand-drawn canvas frame */}
      <path
        d="M9 21.5V11.8c0-1.1.9-2 2-2h9.8c1.1 0 2 .9 2 2v7.2"
        stroke="white"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.95"
      />
      <path
        d="M9 11.5h13.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Pen stroke */}
      <path
        d="M20.5 18.8L25.2 23.5"
        stroke="url(#ss-pen)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="25.5" cy="24" r="1.4" fill="#FDE68A" />
      {/* Live collab cursors */}
      <circle cx="12" cy="14" r="2" fill="#34D399" />
      <circle cx="17.5" cy="16.5" r="1.5" fill="#C4B5FD" opacity="0.95" />
    </svg>
  );
}
