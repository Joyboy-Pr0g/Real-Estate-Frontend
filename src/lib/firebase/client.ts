import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';
import { env } from '@/env';

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const vapidKey = () => env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim() ?? '';

const SERVICE_WORKER_PATH = '/firebase-messaging-sw.js';

export function getFirebaseClientConfigIssues(): string[] {
  const issues: string[] = [];
  if (!firebaseConfig.apiKey?.trim()) issues.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.projectId?.trim()) issues.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.messagingSenderId?.trim()) issues.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!firebaseConfig.appId?.trim()) issues.push('NEXT_PUBLIC_FIREBASE_APP_ID');
  if (!vapidKey()) {
    issues.push('NEXT_PUBLIC_FIREBASE_VAPID_KEY or FIREBASE_VAPID_KEY (see next.config.ts env mapping)');
  }
  return issues;
}

export function isFirebaseClientConfigured(): boolean {
  return getFirebaseClientConfigIssues().length === 0;
}

function ensureCompatApp(): firebase.app.App | null {
  if (!isFirebaseClientConfigured()) return null;
  if (firebase.apps.length > 0) return firebase.app();
  return firebase.initializeApp(firebaseConfig);
}

function isFcmServiceWorkerRegistration(registration: ServiceWorkerRegistration): boolean {
  const scriptUrl = registration.active?.scriptURL
    ?? registration.installing?.scriptURL
    ?? registration.waiting?.scriptURL
    ?? '';
  return scriptUrl.includes('firebase-messaging-sw');
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  const existing = registrations.find(isFcmServiceWorkerRegistration);
  if (existing) {
    await navigator.serviceWorker.ready;
    return existing;
  }

  const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
    scope: '/',
    updateViaCache: 'none',
  });
  await navigator.serviceWorker.ready;
  return registration;
}

async function getTokenWithRetry(
  messaging: firebase.messaging.Messaging,
  key: string,
  registration: ServiceWorkerRegistration,
  attempts = 5,
): Promise<string> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const token = await messaging.getToken({
        vapidKey: key,
        serviceWorkerRegistration: registration,
      });
      if (token) return token;
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
  throw lastError ?? new Error('Failed to obtain FCM token');
}

export async function requestPushToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  const app = ensureCompatApp();
  const key = vapidKey();
  if (!app || !key) return null;

  if (process.env.NODE_ENV === 'development') {
    console.info('[FCM] Requesting push token', {
      projectId: firebaseConfig.projectId,
      serviceWorker: SERVICE_WORKER_PATH,
    });
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    if (process.env.NODE_ENV === 'development') {
      console.info('[FCM] Notification permission not granted:', permission);
    }
    return null;
  }

  const registration = await getServiceWorkerRegistration();
  const messaging = firebase.messaging();

  const token = await getTokenWithRetry(messaging, key, registration);
  if (process.env.NODE_ENV === 'development') {
    console.info('[FCM] Token obtained', { tokenPrefix: `${token.slice(0, 12)}…` });
  }
  return token;
}

export function subscribeForegroundMessages(
  handler: (payload: firebase.messaging.MessagePayload) => void,
): () => void {
  if (typeof window === 'undefined' || !isFirebaseClientConfigured()) {
    return () => undefined;
  }

  ensureCompatApp();
  if (process.env.NODE_ENV === 'development') {
    console.info('[FCM] Foreground message listener attached');
  }
  return firebase.messaging().onMessage(handler);
}
