'use client';

import Link from 'next/link';
import { isHashHref, smoothScrollToHash } from '@/lib/smooth-scroll';
import { cn } from '@/lib/utils';

type SmoothScrollLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
};

export function SmoothScrollLink({
  href,
  className,
  children,
  onNavigate,
}: SmoothScrollLinkProps) {
  if (isHashHref(href)) {
    return (
      <a
        href={href}
        className={cn(className)}
        onClick={(e) => {
          e.preventDefault();
          smoothScrollToHash(href);
          onNavigate?.();
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cn(className)} onClick={() => onNavigate?.()}>
      {children}
    </Link>
  );
}
