'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toaster';
import { refreshAdminPermissions } from '@/features/admin/services/permission-service';
import { getSubAdminFallbackPath } from '@/lib/auth/admin-route-permissions';
import { useLocale } from '@/lib/i18n/locale-provider';

export function AdminAccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    if (searchParams.get('access_denied') !== '1') return;

    void (async () => {
      toast.error(t('admin.permissions.accessDenied'));

      try {
        const permissions = await refreshAdminPermissions();
        const fallback = getSubAdminFallbackPath(permissions);
        const current = window.location.pathname.replace(/\/+$/, '') || '/admin';
        const target = fallback.replace(/\/+$/, '') || '/admin';

        if (current !== target) {
          window.location.assign(fallback);
          return;
        }
      } catch {
        // Fall through to strip the query param only.
      }

      const url = new URL(window.location.href);
      url.searchParams.delete('access_denied');
      router.replace(url.pathname + url.search);
    })();
  }, [router, searchParams, t]);

  return null;
}
