import { Suspense } from 'react';
import { MailCheck } from 'lucide-react';
import { VerifyEmailForm } from '@/features/auth/components/VerifyEmailForm';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';

export default async function VerifyEmailPage() {
  const { t } = await getServerTranslations();

  return (
    <div className="min-h-screen mesh-hero">
      <Container className="flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-[var(--shadow-float)]">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <MailCheck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-primary-dark">{t('auth.verifyEmailTitle')}</h1>
              <p className="text-sm text-gray-500">{t('auth.verifyEmailSubtitle')}</p>
            </div>
          </div>

          <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-gray-100" />}>
            <VerifyEmailForm />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}
