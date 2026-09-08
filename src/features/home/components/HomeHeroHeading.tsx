import { Container } from '@/components/ui/container';
import { getServerTranslations } from '@/lib/i18n/server';

export async function HomeHeroHeading() {
  const { t } = await getServerTranslations();

  return (
    <Container className="relative">
      <div className="mx-auto mb-8 max-w-2xl space-y-3 text-center md:mb-10">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 shadow-sm backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-light" />
          {t('trust.verified')} · {t('trust.secure')}
        </p>
        <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
          {t('hero.title')}
        </h1>
        <p className="text-base leading-relaxed text-white/75 md:text-lg">{t('hero.subtitle')}</p>
      </div>
    </Container>
  );
}
