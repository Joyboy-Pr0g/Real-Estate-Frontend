'use client';

import Image from 'next/image';
import { HeroFloatingTrustIcons } from '@/features/home/components/HeroFloatingTrustIcons';

export function HomeHeroVisual() {
  return (
    <div className="hero-visual pointer-events-none absolute inset-0 z-0" aria-hidden>
      <div className="hero-visual-bg relative h-full w-full overflow-hidden">
        <div className="absolute inset-0 origin-center scale-[0.82]">
          <Image
            src="/real_image.jpeg"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      </div>

      {/* Readability overlays — content sits on the start side (right in RTL) */}
      <div className="absolute inset-0 bg-[#163d2e]/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c231b]/95 via-[#163d2e]/40 to-[#163d2e]/55" />
      <div className="absolute inset-0 bg-gradient-to-s from-[#0c231b]/92 via-[#163d2e]/35 to-transparent" />
      <div className="hero-dot-grid absolute inset-0 opacity-[0.06]" />

      <div className="hidden md:block">
        <HeroFloatingTrustIcons />
      </div>
    </div>
  );
}
