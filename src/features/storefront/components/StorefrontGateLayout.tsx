'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Building2, Rocket, Wrench } from 'lucide-react';
import { Container } from '@/components/ui/container';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import { resolveWebsiteLogo, splitWebsiteTitle } from '@/lib/website-settings/defaults';
import { EASE_OUT_EXPO, Stagger, StaggerItem } from '@/lib/motion/reveal';
import { cn } from '@/lib/utils/cn';

export type StorefrontGateTone = 'brand' | 'amber';

export type StorefrontGateVariant = 'coming_soon' | 'maintenance';

interface StorefrontGateLayoutProps {
  settings: WebsiteSettings;
  variant: StorefrontGateVariant;
  badge: string;
  headline: string;
  message: string;
  tone?: StorefrontGateTone;
}

const gateIcons = {
  coming_soon: Rocket,
  maintenance: Wrench,
} as const;

const toneStyles: Record<
  StorefrontGateTone,
  { ring: string; icon: string; badge: string; orb: string }
> = {
  brand: {
    ring: 'bg-brand-muted/80',
    icon: 'text-brand',
    badge: 'text-brand',
    orb: 'bg-brand/10',
  },
  amber: {
    ring: 'bg-amber-100/90',
    icon: 'text-amber-600',
    badge: 'text-amber-700',
    orb: 'bg-amber-200/40',
  },
};

export function StorefrontGateLayout({
  settings,
  variant,
  badge,
  headline,
  message,
  tone = 'brand',
}: StorefrontGateLayoutProps) {
  const reduced = useReducedMotion();
  const Icon = gateIcons[variant];
  const logoUrl = resolveWebsiteLogo(settings.header_logo_url);
  const brand = splitWebsiteTitle(settings.title);
  const styles = toneStyles[tone];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative z-10 border-b border-gray-200/80 bg-white/90 backdrop-blur-sm">
        <Container>
          <div className="flex h-16 items-center">
            <span className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-brand text-white shadow-md shadow-brand/20">
                {settings.header_logo_url ? (
                  <img src={logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
              </span>
              <span className="text-base font-bold tracking-tight text-primary-dark">
                <span className="text-brand">{brand.primary}</span>
                {brand.secondary ? ` ${brand.secondary}` : ''}
              </span>
            </span>
          </div>
        </Container>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 mesh-hero" />
        <div
          className={cn(
            'pointer-events-none absolute -top-24 start-1/4 h-64 w-64 rounded-full blur-3xl',
            styles.orb,
          )}
        />
        <div className="pointer-events-none absolute bottom-0 end-1/4 h-48 w-48 rounded-full bg-brand/5 blur-3xl" />

        <Container className="relative">
          <Stagger immediate className="mx-auto max-w-lg text-center">
            <StaggerItem immediate>
              <motion.div
                initial={reduced ? false : { scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
                className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center"
              >
                <motion.span
                  className={cn('absolute inset-0 rounded-full', styles.ring)}
                  animate={reduced ? undefined : { scale: [1, 1.06, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="absolute inset-2 rounded-full bg-white shadow-[var(--shadow-soft)]" />
                <Icon className={cn('relative h-10 w-10', styles.icon)} strokeWidth={1.75} />
              </motion.div>
            </StaggerItem>

            <StaggerItem immediate>
              <p
                className={cn(
                  'text-sm font-semibold uppercase tracking-[0.2em]',
                  styles.badge,
                )}
              >
                {badge}
              </p>
            </StaggerItem>

            <StaggerItem immediate>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">
                {headline}
              </h1>
            </StaggerItem>

            <StaggerItem immediate>
              <p className="mt-3 text-base leading-relaxed text-gray-500">{message}</p>
            </StaggerItem>

            <StaggerItem immediate>
              <p className="mt-8">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-400 transition-colors hover:text-brand"
                >
                  تسجيل الدخول للمسؤولين
                </Link>
              </p>
            </StaggerItem>
          </Stagger>
        </Container>
      </div>
    </div>
  );
}
