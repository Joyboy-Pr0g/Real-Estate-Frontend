'use client';

import { useEffect, useRef } from 'react';
import { AuthUser } from '@/features/auth/types/user';
import {
  getFirebaseClientConfigIssues,
  isFirebaseClientConfigured,
  requestPushToken,
} from '@/lib/firebase/client';
import { registerDeviceToken } from '@/features/messaging/services/messaging-client';
import { ApiError } from '@/lib/errors/api-error';

interface PushTokenRegisterProps {
  user: AuthUser | null;
}

let configWarningLogged = false;
let registerInFlight: Promise<void> | null = null;

function isDuplicateDeviceTokenError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return /duplicate key|UQ_user_device_tokens_token/i.test(error.message);
}

export function PushTokenRegister({ user }: PushTokenRegisterProps) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!user || registeredRef.current) return;

    if (!isFirebaseClientConfigured()) {
      if (!configWarningLogged) {
        configWarningLogged = true;
        console.warn('[FCM] Push notifications disabled — missing env:', getFirebaseClientConfigIssues().join(', '));
      }
      return;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (registerInFlight) return;

    registerInFlight = (async () => {
      try {
        const token = await requestPushToken();
        if (!token) return;

        await registerDeviceToken(token, 'web');
        registeredRef.current = true;
        if (process.env.NODE_ENV === 'development') {
          console.info('[FCM] Device token registered with backend');
        }
      } catch (error) {
        if (isDuplicateDeviceTokenError(error)) {
          registeredRef.current = true;
          if (process.env.NODE_ENV === 'development') {
            console.info('[FCM] Device token already registered');
          }
          return;
        }
        console.warn('[FCM] Token registration failed:', error);
      } finally {
        registerInFlight = null;
      }
    })();
  }, [user]);

  return null;
}
