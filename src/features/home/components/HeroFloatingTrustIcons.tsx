'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import {
  BadgeCheck,
  Building2,
  Heart,
  MapPin,
  Search,
  Shield,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';
import { ensureGsapPlugins, gsap, prefersReducedMotion } from '@/lib/motion/gsap-config';
import { cn } from '@/lib/utils/cn';

type FloatIconDef = {
  key: TranslationKey;
  icon: LucideIcon;
  style: React.CSSProperties;
  variant?: 'pill' | 'icon';
};

const ORBIT_ICONS: FloatIconDef[] = [
  { key: 'trust.verified', icon: BadgeCheck, style: { top: '10%', left: '6%' }, variant: 'pill' },
  { key: 'trust.maps', icon: MapPin, style: { top: '18%', left: '28%' }, variant: 'icon' },
  { key: 'trust.search', icon: Search, style: { top: '34%', left: '10%' }, variant: 'pill' },
  { key: 'trust.agents', icon: UserCheck, style: { top: '44%', left: '32%' }, variant: 'pill' },
  { key: 'trust.secure', icon: Shield, style: { top: '58%', left: '5%' }, variant: 'icon' },
  { key: 'trust.listings', icon: Building2, style: { bottom: '32%', left: '18%' }, variant: 'pill' },
  { key: 'trust.saved', icon: Heart, style: { bottom: '18%', left: '8%' }, variant: 'pill' },
];

function FloatIcon({ item }: { item: FloatIconDef }) {
  const { t } = useLocale();
  const Icon = item.icon;
  const isIconOnly = item.variant === 'icon';

  return (
    <div
      className={cn(
        'hero-float-icon pointer-events-none absolute z-30 flex items-center will-change-transform',
        isIconOnly
          ? 'h-11 w-11 justify-center rounded-2xl border border-white/20 bg-white/15 shadow-md shadow-black/10'
          : 'gap-2 rounded-2xl border border-white/20 bg-white/10 px-2.5 py-2 shadow-md shadow-black/10 sm:px-3',
      )}
      style={item.style}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </span>
      {!isIconOnly ? (
        <span className="max-w-[6.5rem] truncate text-[11px] font-semibold text-white sm:max-w-[7.5rem] sm:text-xs">
          {t(item.key)}
        </span>
      ) : null}
    </div>
  );
}

export function HeroFloatingTrustIcons() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const scope = containerRef.current;
      if (!scope || prefersReducedMotion()) return;

      scope.querySelectorAll<HTMLElement>('.hero-float-icon').forEach((el, index) => {
        const floatDuration = 1.6 + (index % 3) * 0.15;
        const floatDelay = index * 0.06;

        gsap.fromTo(
          el,
          { opacity: 0, y: 4 },
          { opacity: 1, y: 0, duration: 0.28, delay: floatDelay, ease: 'power1.out' },
        );

        gsap.to(el, {
          y: -5,
          duration: floatDuration,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 0.15 + floatDelay,
        });
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className="pointer-events-none absolute inset-0 z-[5] overflow-visible hidden md:block"
      aria-hidden
    >
      {ORBIT_ICONS.map((item) => (
        <FloatIcon key={item.key} item={item} />
      ))}
    </div>
  );
}
