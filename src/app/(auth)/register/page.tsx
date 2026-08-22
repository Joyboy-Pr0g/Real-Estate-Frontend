import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';

export default async function RegisterPage() {
  const user = await getSession();
  if (user?.email_verified_at) {
    redirect(user.role === 'platform_admin' ? '/admin' : '/');
  }

  const { t } = await getServerTranslations();

  return (
    <div className="min-h-screen mesh-hero">
      <Container className="flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-[var(--shadow-float)]">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-primary-dark">{t('auth.registerTitle')}</h1>
              <p className="text-sm text-gray-500">{t('auth.registerSubtitle')}</p>
            </div>
          </div>

          <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-gray-100" />}>
            <RegisterForm />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}
