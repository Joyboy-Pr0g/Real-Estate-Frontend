'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getNotificationUnreadCountClient,
  NOTIFICATIONS_REFRESH_EVENT,
} from '@/features/notifications/services/notification-client';

export function useNotificationUnreadCount(enabled = true) {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      const value = await getNotificationUnreadCountClient();
      setCount(value);
    } catch {
      setCount(0);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
    const onRefresh = () => void load();
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh);
    const interval = setInterval(load, 60000);
    return () => {
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh);
      clearInterval(interval);
    };
  }, [load]);

  return count;
}
