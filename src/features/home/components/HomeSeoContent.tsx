import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { getServerTranslations } from '@/lib/i18n/server';

export async function HomeSeoContent() {
  const { t } = await getServerTranslations();

  return (
    <section className="border-t border-gray-100 bg-gray-50/80 py-12 md:py-16" aria-labelledby="home-seo-intro">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8 text-gray-600">
          <div className="space-y-4">
            <h2 id="home-seo-intro" className="text-2xl font-bold text-primary-dark lg:text-3xl">
              {t('home.seo.intro.title')}
            </h2>
            <p className="text-base leading-relaxed">{t('home.seo.intro.p1')}</p>
            <p className="text-base leading-relaxed">{t('home.seo.intro.p2')}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-dark lg:text-2xl">{t('home.seo.browse.title')}</h2>
            <p className="text-base leading-relaxed">{t('home.seo.browse.p1')}</p>
            <p className="text-base leading-relaxed">{t('home.seo.browse.p2')}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-dark lg:text-2xl">{t('home.seo.trust.title')}</h2>
            <p className="text-base leading-relaxed">{t('home.seo.trust.p1')}</p>
            <p className="text-base leading-relaxed">{t('home.seo.trust.p2')}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-dark lg:text-2xl">{t('home.seo.start.title')}</h2>
            <p className="text-base leading-relaxed">{t('home.seo.start.p1')}</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
              <li>
                <Link href="/listings" className="text-brand hover:underline">
                  {t('nav.listings')}
                </Link>
              </li>
              <li>
                <Link href="/listings/map" className="text-brand hover:underline">
                  {t('nav.map')}
                </Link>
              </li>
              <li>
                <Link href="/offices" className="text-brand hover:underline">
                  {t('nav.offices')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-brand hover:underline">
                  {t('home.seo.start.aboutLink')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
