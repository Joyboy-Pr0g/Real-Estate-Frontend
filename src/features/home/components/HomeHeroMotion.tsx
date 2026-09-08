'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import {
  ensureGsapPlugins,
  gsap,
  GSAP_EASE,
  prefersReducedMotion,
} from '@/lib/motion/gsap-config';

interface HomeHeroMotionProps {
  children: ReactNode;
}

export function HomeHeroMotion({ children }: HomeHeroMotionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const scope = containerRef.current;
      if (!scope || prefersReducedMotion()) return;

      const bg = scope.querySelector('.hero-visual-bg');
      if (bg) {
        gsap.fromTo(bg, { scale: 1.06, opacity: 0.85 }, { scale: 1, opacity: 1, duration: 1.1, ease: GSAP_EASE });
      }

      const tl = gsap.timeline({ defaults: { ease: GSAP_EASE } });
      const title = scope.querySelector('.hero-title');
      const subtitle = scope.querySelector('.hero-subtitle');
      const description = scope.querySelector('.hero-description');
      const ctas = scope.querySelector('.hero-ctas');
      const search = scope.querySelector('.hero-search');

      if (title) tl.from(title, { y: 18, opacity: 0, duration: 0.5 });
      if (subtitle) tl.from(subtitle, { y: 14, opacity: 0, duration: 0.4 }, '-=0.25');
      if (description) tl.from(description, { y: 14, opacity: 0, duration: 0.4 }, '-=0.2');
      if (ctas) tl.from(ctas, { y: 12, opacity: 0, duration: 0.35 }, '-=0.15');
      if (search) tl.from(search, { y: 24, opacity: 0, scale: 0.98, duration: 0.55 }, '-=0.1');
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="contents">
      {children}
    </div>
  );
}
