'use client';

import { useEffect, useRef } from 'react';
import { AuthUser } from '@/features/auth/types/user';
import { isFirebaseClientConfigured, requestPushToken } from '@/lib/firebase/client';
import { registerDeviceToken } from '@/features/messaging/services/messaging-client';

interface PushTokenRegisterProps {
  user: AuthUser | null;
}

export function PushTokenRegister({ user }: PushTokenRegisterProps) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!user || registeredRef.current) return;
    if (!isFirebaseClientConfigured()) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    registeredRef.current = true;

    void (async () => {
      try {
        const token = await requestPushToken();
        if (!token) return;
        await registerDeviceToken(token, 'web');
      } catch (error) {
        registeredRef.current = false;
        console.warn('[FCM] Token registration failed:', error);
      }
    })();
  }, [user]);

  return null;
}
