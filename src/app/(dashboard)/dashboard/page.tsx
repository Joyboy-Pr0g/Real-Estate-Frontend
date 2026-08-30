import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { ProfileSettingsPanel } from '@/features/dashboard/components/ProfileSettingsPanel';

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role === 'platform_admin') redirect('/admin');

  const { t } = await getServerTranslations();

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-primary-dark">
          {t('dashboard.welcome', { name: user.f_name })}
        </h1>
        <p className="mt-2 text-gray-500">{t('dashboard.dashboardHint')}</p>

        <div className="mt-8">
          <ProfileSettingsPanel user={user} />
        </div>
      </div>
    </Container>
  );
}
