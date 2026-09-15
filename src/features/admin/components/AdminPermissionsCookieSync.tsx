'use client';

import { useEffect } from 'react';
import { refreshAdminPermissions } from '@/features/admin/services/permission-service';

/** Client fallback: refresh proxy cookie if layout/server sync was missed. */
export function AdminPermissionsCookieSync() {
  useEffect(() => {
    void refreshAdminPermissions().catch(() => {});
  }, []);

  return null;
}
