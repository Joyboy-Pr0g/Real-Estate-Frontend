import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { getServerTranslations } from '@/lib/i18n/server';
import { cn } from '@/lib/utils/cn';

export async function HomeHeroHeading() {
  const { t } = await getServerTranslations();

  return (
    <div className="relative mx-auto max-w-xl text-center lg:mx-0 lg:text-start">
      <div className="relative space-y-4">
        <h1 className="hero-title text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
          {t('hero.titlePrefix')}{' '}
          <span className="hero-title-accent text-brand-light">{t('hero.titleAccent')}</span>
        </h1>

        <p className="hero-subtitle text-lg font-semibold text-white/90 md:text-xl">
          {t('hero.subtitle')}
        </p>

        <p className="hero-description mx-auto max-w-lg text-base leading-relaxed text-white/70 md:text-[1.05rem] lg:mx-0">
          {t('hero.description')}
        </p>

        <div className="hero-ctas flex flex-wrap items-center justify-center gap-3 pt-2 lg:justify-start">
          <Link
            href="/listings"
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-brand transition-colors hover:bg-white/90',
            )}
          >
            {t('hero.discoverListings')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/offices"
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/15',
            )}
          >
            <Building2 className="h-4 w-4" />
            {t('hero.browseOffices')}
          </Link>
        </div>
      </div>
    </div>
  );
}
