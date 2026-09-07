'use client';

import { SearchPill } from '@/features/home/components/SearchPill';
import { TrustMarquee } from '@/features/home/components/TrustMarquee';
import { PublicCatalog } from '@/features/catalog/types/catalog';
import { Reveal, Stagger, StaggerItem } from '@/lib/motion/reveal';
import { useLocale } from '@/lib/i18n/locale-provider';
import { Container } from '@/components/ui/container';

interface HomeHeroProps {
  catalog: PublicCatalog;
}

export function HomeHero({ catalog }: HomeHeroProps) {
  const { t } = useLocale();

  return (
    <section className="hero-bayut relative z-10 overflow-visible pb-8 pt-4 md:pb-10 md:pt-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 start-1/4 h-64 w-64 rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute top-0 end-1/4 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />
      </div>

      <Container className="relative">
        <Stagger immediate className="text-center space-y-3 mb-8 md:mb-10 max-w-2xl mx-auto">
          <StaggerItem immediate>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-light animate-pulse" />
              {t('trust.verified')} · {t('trust.secure')}
            </p>
          </StaggerItem>
          <StaggerItem immediate>
            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-white leading-[1.15]">
              {t('hero.title')}
            </h1>
          </StaggerItem>
          <StaggerItem immediate>
            <p className="text-base md:text-lg text-white/75 leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </StaggerItem>
        </Stagger>

        <Reveal immediate className="relative z-30">
          <SearchPill catalog={catalog} />
        </Reveal>
      </Container>

      <TrustMarquee />
    </section>
  );
}
