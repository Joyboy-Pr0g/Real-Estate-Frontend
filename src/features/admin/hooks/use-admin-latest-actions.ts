'use client';

import { useEffect, useState } from 'react';
import { getAdminLatestActions } from '@/features/admin/services/admin-action-logs-client';
import { AdminLatestAction } from '@/features/admin/types/action-logs';

export function useAdminLatestActions(entityType: string, entityIds: string[], refreshKey = 0) {
  const [actions, setActions] = useState<Record<string, AdminLatestAction>>({});
  const idsKey = entityIds.join(',');

  useEffect(() => {
    if (!idsKey) {
      setActions({});
      return;
    }

    let cancelled = false;
    void getAdminLatestActions(entityType, entityIds)
      .then((data) => {
        if (!cancelled) setActions(data);
      })
      .catch(() => {
        if (!cancelled) setActions({});
      });

    return () => {
      cancelled = true;
    };
  }, [entityType, idsKey, refreshKey]);

  return actions;
}
