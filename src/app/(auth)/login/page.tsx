import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';

export default async function LoginPage() {
  const user = await getSession();
  if (user?.role === 'platform_admin') redirect('/admin');

  const { t } = await getServerTranslations();

  return (
    <div className="min-h-screen mesh-hero">
      <Container className="flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-[var(--shadow-float)]">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-primary-dark">{t('auth.loginTitle')}</h1>
              <p className="text-sm text-gray-500">{t('auth.loginSubtitle')}</p>
            </div>
          </div>

          <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-gray-100" />}>
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('auth.noAccount')}{' '}
            <Link href="/register" className="font-medium text-brand hover:text-brand-dark">
              {t('auth.createOne')}
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
