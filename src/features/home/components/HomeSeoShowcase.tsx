'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowRight, BadgeCheck, MapPin, Shield } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { HomeSeoSlider } from '@/features/home/components/HomeSeoSlider';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import {
  ensureGsapPlugins,
  gsap,
  GSAP_EASE,
  prefersReducedMotion,
  SCROLL_START,
} from '@/lib/motion/gsap-config';

const TRUST_ITEMS = [
  { icon: BadgeCheck, key: 'trust.verified' as const },
  { icon: MapPin, key: 'trust.maps' as const },
  { icon: Shield, key: 'trust.secure' as const },
] as const;

interface HomeSeoShowcaseProps {
  settings: WebsiteSettings;
}

export function HomeSeoShowcase({ settings }: HomeSeoShowcaseProps) {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const scope = containerRef.current;
      if (!scope || prefersReducedMotion()) return;

      const slider = scope.querySelector('.home-seo-slider');
      const ctas = scope.querySelector('.home-seo-ctas');
      const pills = scope.querySelectorAll('.home-seo-trust-pill');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: SCROLL_START,
          once: true,
        },
        defaults: { ease: GSAP_EASE },
      });

      if (slider) tl.from(slider, { y: 32, opacity: 0, duration: 0.55 });
      if (ctas) tl.from(ctas, { y: 20, opacity: 0, duration: 0.45 }, '-=0.2');
      if (pills.length) {
        tl.from(
          pills,
          {
            y: 16,
            opacity: 0,
            scale: 0.92,
            duration: 0.4,
            stagger: 0.08,
          },
          '-=0.15',
        );
      }
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="mx-auto max-w-2xl space-y-6 text-center">
      <div className="home-seo-slider">
        <HomeSeoSlider settings={settings} />
      </div>

      <div className="home-seo-ctas flex flex-col items-center justify-center gap-3 sm:flex-row">
        <ButtonLink href="/listings" size="md">
          {t('home.seo.searchNow')}
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
        <ButtonLink href="/listings/map" variant="outline" size="md">
          {t('home.seo.browseMap')}
        </ButtonLink>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        {TRUST_ITEMS.map(({ icon: Icon, key }) => (
          <span
            key={key}
            className="home-seo-trust-pill inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
          >
            <Icon className="h-3.5 w-3.5 text-brand" aria-hidden />
            {t(key)}
          </span>
        ))}
      </div>
    </div>
  );
}
