'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toaster';
import { useLocale } from '@/lib/i18n/locale-provider';

export function AdminAccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    if (searchParams.get('access_denied') === '1') {
      toast.error(t('admin.permissions.accessDenied'));
      const url = new URL(window.location.href);
      url.searchParams.delete('access_denied');
      router.replace(url.pathname + url.search);
    }
  }, [router, searchParams, t]);

  return null;
}
