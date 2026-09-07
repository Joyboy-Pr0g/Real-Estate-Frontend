import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getServerTranslations } from '@/lib/i18n/server';

interface ListingGoneViewProps {
  slug: string;
}

export async function ListingGoneView({ slug }: ListingGoneViewProps) {
  const { t } = await getServerTranslations();

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-lg text-center space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">{t('listingGone.badge')}</p>
        <h1 className="text-3xl font-bold text-primary-dark">{t('listingGone.title')}</h1>
        <p className="text-gray-600 leading-relaxed">{t('listingGone.description')}</p>
        <p className="text-xs text-gray-400 font-mono break-all">{slug}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <ButtonLink href="/listings" className="rounded-full gap-2">
            <Search className="h-4 w-4" />
            {t('listingGone.browseListings')}
          </ButtonLink>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4" />
            {t('listingGone.backHome')}
          </Link>
        </div>
      </div>
    </Container>
  );
}
