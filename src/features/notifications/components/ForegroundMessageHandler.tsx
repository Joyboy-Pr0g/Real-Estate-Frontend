'use client';

import { useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { isFirebaseClientConfigured, subscribeForegroundMessages } from '@/lib/firebase/client';
import { handleFcmPush } from '@/lib/firebase/handle-fcm-push';

const FCM_SW_MESSAGE_TYPE = 'fcm-push';

function isFcmSwMessage(data: unknown): data is { type: string; payload: firebase.messaging.MessagePayload } {
  if (!data || typeof data !== 'object') return false;
  const record = data as { type?: unknown; payload?: unknown };
  return record.type === FCM_SW_MESSAGE_TYPE && record.payload != null && typeof record.payload === 'object';
}

export function ForegroundMessageHandler() {
  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;

    const unsubscribe = subscribeForegroundMessages((payload) => {
      handleFcmPush(payload);
    });

    const onServiceWorkerMessage = (event: MessageEvent) => {
      if (!isFcmSwMessage(event.data)) return;
      const showToast = typeof document !== 'undefined' && document.visibilityState === 'visible';
      handleFcmPush(event.data.payload, { showToast });
    };

    navigator.serviceWorker?.addEventListener('message', onServiceWorkerMessage);

    return () => {
      unsubscribe();
      navigator.serviceWorker?.removeEventListener('message', onServiceWorkerMessage);
    };
  }, []);

  return null;
}
