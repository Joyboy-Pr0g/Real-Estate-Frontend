import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftRight, Home, Landmark, Layers, ListTree, MapPin, Sparkles, Users } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';

export default async function AdminDashboardPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'platform_admin') redirect('/');

  const { t } = await getServerTranslations();

  return (
    <Container className="py-8">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-primary-dark">
          {t('admin.welcome', { name: user.f_name })}
        </h1>
        <p className="mt-2 text-gray-500">{t('admin.dashboardHint')}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/users"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)] transition-all hover:border-brand/30 hover:shadow-[var(--shadow-float)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Users className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-primary-dark group-hover:text-brand-dark">
            {t('admin.manageUsers')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t('admin.manageUsersHint')}</p>
        </Link>

        <Link
          href="/admin/property-types"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)] transition-all hover:border-brand/30 hover:shadow-[var(--shadow-float)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Home className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-primary-dark group-hover:text-brand-dark">
            {t('admin.managePropertyTypes')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t('admin.managePropertyTypesHint')}</p>
        </Link>

        <Link
          href="/admin/property-subtypes"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)] transition-all hover:border-brand/30 hover:shadow-[var(--shadow-float)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Layers className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-primary-dark group-hover:text-brand-dark">
            {t('admin.managePropertySubtypes')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t('admin.managePropertySubtypesHint')}</p>
        </Link>

        <Link
          href="/admin/transaction-types"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)] transition-all hover:border-brand/30 hover:shadow-[var(--shadow-float)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <ArrowLeftRight className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-primary-dark group-hover:text-brand-dark">
            {t('admin.manageTransactionTypes')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t('admin.manageTransactionTypesHint')}</p>
        </Link>

        <Link
          href="/admin/cities"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)] transition-all hover:border-brand/30 hover:shadow-[var(--shadow-float)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Landmark className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-primary-dark group-hover:text-brand-dark">
            {t('admin.manageCities')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t('admin.manageCitiesHint')}</p>
        </Link>

        <Link
          href="/admin/neighborhoods"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)] transition-all hover:border-brand/30 hover:shadow-[var(--shadow-float)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <MapPin className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-primary-dark group-hover:text-brand-dark">
            {t('admin.manageNeighborhoods')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t('admin.manageNeighborhoodsHint')}</p>
        </Link>

        <Link
          href="/admin/features"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)] transition-all hover:border-brand/30 hover:shadow-[var(--shadow-float)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Sparkles className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-primary-dark group-hover:text-brand-dark">
            {t('admin.manageMainFeatures')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t('admin.manageMainFeaturesHint')}</p>
        </Link>

        <Link
          href="/admin/sub-features"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)] transition-all hover:border-brand/30 hover:shadow-[var(--shadow-float)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <ListTree className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-primary-dark group-hover:text-brand-dark">
            {t('admin.manageSubFeatures')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t('admin.manageSubFeaturesHint')}</p>
        </Link>
      </div>
    </Container>
  );
}
