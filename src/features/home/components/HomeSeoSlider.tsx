'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  Building2,
  MapPin,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';
import { splitWebsiteTitle, withWebsiteSettingsDefaults } from '@/lib/website-settings/defaults';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import type { TranslationKey } from '@/lib/i18n/ar';

const SLIDE_INTERVAL_MS = 6000;

type SlideConfig = {
  icon: LucideIcon;
  badgeKey: TranslationKey;
  headingKey: TranslationKey;
  bodyKey: TranslationKey;
  headingTag: 'h2' | 'h3';
};

const SLIDES: SlideConfig[] = [
  {
    icon: Sparkles,
    badgeKey: 'home.seo.slide1Badge',
    headingKey: 'home.seo.heading',
    bodyKey: 'home.seo.intro',
    headingTag: 'h2',
  },
  {
    icon: MapPin,
    badgeKey: 'home.seo.slide2Badge',
    headingKey: 'home.seo.browseHeading',
    bodyKey: 'home.seo.browseBody',
    headingTag: 'h3',
  },
  {
    icon: BadgeCheck,
    badgeKey: 'home.seo.slide3Badge',
    headingKey: 'home.seo.trustHeading',
    bodyKey: 'home.seo.trustBody',
    headingTag: 'h3',
  },
  {
    icon: Building2,
    badgeKey: 'home.seo.slide4Badge',
    headingKey: 'home.seo.ctaHeading',
    bodyKey: 'home.seo.ctaBody',
    headingTag: 'h3',
  },
];

interface HomeSeoSliderProps {
  settings: WebsiteSettings;
  className?: string;
}

export function HomeSeoSlider({ settings, className }: HomeSeoSliderProps) {
  const { t } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const s = withWebsiteSettingsDefaults(settings);
  const { primary, secondary } = splitWebsiteTitle(s.title);
  const brand = secondary ? `${primary} ${secondary}` : primary;

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
  }, []);

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(goNext, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [goNext, paused]);

  const activeSlide = SLIDES[activeIndex];
  const ActiveIcon = activeSlide.icon;
  const HeadingTag = activeSlide.headingTag;

  const formatCopy = (text: string) =>
    text.replaceAll('{brand}', brand).replaceAll('{metaTitle}', s.meta_title ?? brand);

  return (
    <div
      className={cn('mx-auto w-full max-w-2xl', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-brand/20 bg-white shadow-[0_8px_40px_rgba(30,107,69,0.08)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(30,107,69,0.08),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_100%,rgba(30,107,69,0.06),transparent_50%)]" />

        <div className="relative p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/15 bg-brand-muted px-3 py-1 text-xs font-medium text-brand">
              <ActiveIcon className="h-3.5 w-3.5" aria-hidden />
              {t(activeSlide.badgeKey)}
            </span>
            <span className="text-[11px] tabular-nums text-gray-400">
              {activeIndex + 1} / {SLIDES.length}
            </span>
          </div>

          <div className="relative min-h-[140px] sm:min-h-[128px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeSlide.bodyKey}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-2.5"
              >
                <HeadingTag
                  id={activeSlide.headingTag === 'h2' ? 'home-seo-heading' : undefined}
                  className="text-lg font-bold leading-snug text-primary-dark sm:text-xl"
                >
                  {formatCopy(t(activeSlide.headingKey))}
                </HeadingTag>
                <p className="line-clamp-4 text-sm leading-relaxed text-gray-600">
                  {formatCopy(t(activeSlide.bodyKey))}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-5 space-y-2.5">
            <div className="h-1 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                key={`${activeIndex}-${paused ? 'paused' : 'play'}`}
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light"
                initial={{ width: '0%' }}
                animate={{
                  width: paused ? `${((activeIndex + 1) / SLIDES.length) * 100}%` : '100%',
                }}
                transition={{
                  duration: paused ? 0.2 : SLIDE_INTERVAL_MS / 1000,
                  ease: 'linear',
                }}
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              {SLIDES.map((slide, index) => (
                <button
                  key={slide.bodyKey}
                  type="button"
                  aria-label={`${t(slide.badgeKey)} (${index + 1}/${SLIDES.length})`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  onClick={() => goTo(index)}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    index === activeIndex
                      ? 'w-7 bg-brand'
                      : 'w-2 bg-gray-200 hover:bg-gray-300',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sr-only">
        {SLIDES.map((slide) => (
          <article key={`seo-${slide.bodyKey}`}>
            {slide.headingTag === 'h2' ? (
              <h2>{formatCopy(t(slide.headingKey))}</h2>
            ) : (
              <h3>{formatCopy(t(slide.headingKey))}</h3>
            )}
            <p>{formatCopy(t(slide.bodyKey))}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
