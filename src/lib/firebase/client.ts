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

const SERVICE_WORKER_PATH = '/firebase-messaging-sw.js';

export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey
      && firebaseConfig.projectId
      && firebaseConfig.messagingSenderId
      && firebaseConfig.appId
      && process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim(),
  );
}

function ensureCompatApp(): firebase.app.App | null {
  if (!isFirebaseClientConfigured()) return null;
  if (firebase.apps.length > 0) return firebase.app();
  return firebase.initializeApp(firebaseConfig);
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH);
  const registration = existing
    ?? await navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: '/', updateViaCache: 'none' });
  await navigator.serviceWorker.ready;
  return registration;
}

async function getTokenWithRetry(
  messaging: firebase.messaging.Messaging,
  vapidKey: string,
  registration: ServiceWorkerRegistration,
  attempts = 5,
): Promise<string> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const token = await messaging.getToken({
        vapidKey,
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
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();
  if (!app || !vapidKey) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const registration = await getServiceWorkerRegistration();
  const messaging = firebase.messaging();

  return getTokenWithRetry(messaging, vapidKey, registration);
}

export function subscribeForegroundMessages(
  handler: (payload: firebase.messaging.MessagePayload) => void,
): () => void {
  if (typeof window === 'undefined' || !isFirebaseClientConfigured()) {
    return () => undefined;
  }

  ensureCompatApp();
  return firebase.messaging().onMessage(handler);
}
