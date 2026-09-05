'use client';

import { useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { toast } from '@/components/ui/toaster';
import { isFirebaseClientConfigured, subscribeForegroundMessages } from '@/lib/firebase/client';
import { dispatchNotificationsRefresh } from '@/features/notifications/services/notification-client';

function parsePushPayload(payload: firebase.messaging.MessagePayload): {
  title: string;
  message: string;
  href: string | null;
} | null {
  const title = payload.notification?.title ?? payload.data?.title ?? '';
  const message = payload.notification?.body ?? payload.data?.body ?? '';
  const href = payload.data?.linkPath?.trim() || payload.data?.link_path?.trim() || null;

  if (!title && !message) return null;

  return {
    title: title || message,
    message: title ? message : '',
    href,
  };
}

export function ForegroundMessageHandler() {
  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;

    const unsubscribe = subscribeForegroundMessages((payload) => {
      dispatchNotificationsRefresh();

      const parsed = parsePushPayload(payload);
      if (!parsed) return;

      toast.notification({
        title: parsed.title,
        message: parsed.message,
        href: parsed.href,
      });
    });

    return unsubscribe;
  }, []);

  return null;
}
