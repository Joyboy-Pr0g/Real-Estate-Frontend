'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Home,
  MapPin,
  MessageCircle,
  Search,
  Shield,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import { useLocale } from '@/lib/i18n/locale-provider';
import {
  ensureGsapPlugins,
  gsap,
  GSAP_EASE,
  prefersReducedMotion,
  SCROLL_START,
  ScrollTrigger,
} from '@/lib/motion/gsap-config';

const SERVICE_KEYS = [
  { icon: Search, titleKey: 'about.services.search.title' as const, descKey: 'about.services.search.desc' as const },
  { icon: MapPin, titleKey: 'about.services.map.title' as const, descKey: 'about.services.map.desc' as const },
  { icon: Building2, titleKey: 'about.services.offices.title' as const, descKey: 'about.services.offices.desc' as const },
  { icon: MessageCircle, titleKey: 'about.services.messaging.title' as const, descKey: 'about.services.messaging.desc' as const },
  { icon: Home, titleKey: 'about.services.listings.title' as const, descKey: 'about.services.listings.desc' as const },
  { icon: Shield, titleKey: 'about.services.trust.title' as const, descKey: 'about.services.trust.desc' as const },
] as const;

const VALUE_KEYS = [
  { icon: BadgeCheck, key: 'about.values.verified' as const },
  { icon: MapPin, key: 'about.values.local' as const },
  { icon: Shield, key: 'about.values.secure' as const },
] as const;

interface AboutPageShowcaseProps {
  settings: WebsiteSettings;
}

function animateOnScroll(
  target: Element | Element[] | NodeListOf<Element>,
  vars: gsap.TweenVars,
) {
  gsap.from(target, {
    scrollTrigger: {
      trigger: target instanceof Element ? target : (target as Element[])[0],
      start: SCROLL_START,
      once: true,
    },
    ...vars,
  });
}

export function AboutPageShowcase({ settings }: AboutPageShowcaseProps) {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const scope = containerRef.current;
      if (!scope || prefersReducedMotion()) return;

      const hero = scope.querySelector('.about-hero');
      if (hero) {
        const tl = gsap.timeline({ defaults: { ease: GSAP_EASE } });
        tl.from(hero, { y: 28, opacity: 0, duration: 0.55 });
      }

      const mission = scope.querySelector('.about-mission');
      if (mission) {
        animateOnScroll(mission, { y: 24, opacity: 0, duration: 0.5, ease: GSAP_EASE });
      }

      const servicesHeader = scope.querySelector('.about-services-header');
      if (servicesHeader) {
        animateOnScroll(servicesHeader, { y: 20, opacity: 0, duration: 0.45, ease: GSAP_EASE });
      }

      const cards = scope.querySelectorAll('.about-service-card');
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 32, scale: 0.96 });

        ScrollTrigger.batch(cards, {
          start: SCROLL_START,
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.45,
              stagger: 0.08,
              ease: GSAP_EASE,
              overwrite: true,
            });
          },
        });
      }

      const values = scope.querySelectorAll('.about-value-pill');
      if (values.length) {
        gsap.set(values, { opacity: 0, y: 16 });

        ScrollTrigger.batch(values, {
          start: SCROLL_START,
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: 0.35,
              stagger: 0.06,
              ease: GSAP_EASE,
              overwrite: true,
            });
          },
        });
      }

      const cta = scope.querySelector('.about-cta');
      if (cta) {
        animateOnScroll(cta, { y: 20, opacity: 0, duration: 0.4, ease: GSAP_EASE });
      }
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="space-y-12 lg:space-y-16">
      <section className="about-hero relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-brand-muted/30 to-white p-8 shadow-[var(--shadow-soft)] lg:p-12">
        <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-brand/5 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-3 py-1 text-xs font-semibold text-brand">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            {t('about.badge')}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary-dark lg:text-4xl">{settings.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600 lg:text-lg">{settings.description}</p>
        </div>
      </section>

      <section className="about-mission mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold text-primary-dark">{t('about.mission.title')}</h2>
        <p className="mt-3 text-base leading-relaxed text-gray-600">{t('about.mission.body')}</p>
        {settings.legal_entity_name ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50/80 p-5">
            <p className="text-sm font-semibold text-primary-dark">{settings.legal_entity_name}</p>
            {settings.address_text ? (
              <p className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                {settings.address_text}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section>
        <div className="about-services-header mb-8 text-center">
          <h2 className="text-2xl font-bold text-primary-dark lg:text-3xl">{t('about.services.heading')}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-500 lg:text-base">{t('about.services.subheading')}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_KEYS.map(({ icon: Icon, titleKey, descKey }) => (
            <article
              key={titleKey}
              className="about-service-card group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-brand/25 hover:shadow-[var(--shadow-float)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-muted text-brand transition group-hover:bg-brand group-hover:text-white">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-primary-dark">{t(titleKey)}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{t(descKey)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-center gap-3">
        {VALUE_KEYS.map(({ icon: Icon, key }) => (
          <span
            key={key}
            className="about-value-pill inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm"
          >
            <Icon className="h-4 w-4 text-brand" aria-hidden />
            {t(key)}
          </span>
        ))}
      </section>

      <section className="about-cta rounded-2xl border border-brand/15 bg-brand-muted/40 p-8 text-center lg:p-10">
        <h2 className="text-xl font-bold text-primary-dark lg:text-2xl">{t('about.cta.title')}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">{t('about.cta.body')}</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/listings" size="md">
            {t('home.seo.searchNow')}
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <Link href="/contact" className="text-sm font-semibold text-brand hover:underline">
            {t('nav.contact')}
          </Link>
        </div>
      </section>
    </div>
  );
}
