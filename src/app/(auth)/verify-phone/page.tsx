import { Suspense } from 'react';
import { VerifyPhonePageClient } from '@/features/auth/components/VerifyPhonePageClient';
import { getServerTranslations } from '@/lib/i18n/server';

export default async function VerifyPhonePage() {
  const { t } = await getServerTranslations();

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-xl font-bold text-primary-dark">{t('auth.verifyPhoneTitle')}</h1>
        <p className="mt-2 text-sm text-gray-500">{t('auth.verifyPhoneSubtitle')}</p>
        <Suspense fallback={<p className="mt-6 text-sm text-gray-400">{t('auth.loading')}</p>}>
          <VerifyPhonePageClient />
        </Suspense>
      </div>
    </div>
  );
}
