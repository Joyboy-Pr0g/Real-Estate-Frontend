'use client';

import { useEffect } from 'react';
import { fetchMyPermissions } from '@/features/admin/services/permission-service';

/** Keeps the proxy permissions cookie in sync via the BFF route handler. */
export function AdminPermissionsCookieSync() {
  useEffect(() => {
    void fetchMyPermissions().catch(() => {});
  }, []);

  return null;
}
