export const dynamic = 'force-dynamic';
import { env } from '@/env';

export async function GET() {
  const config = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  };

  if (!config.apiKey || !config.projectId) {
    return new Response('// Firebase is not configured', {
      status: 503,
      headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
    });
  }

  const script = `importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? payload.data?.title ?? 'اليمن للعقارات';
  const body = payload.notification?.body ?? payload.data?.body ?? '';
  self.registration.showNotification(title, { body, icon: '/favicon.ico' });
});
`;

  return new Response(script, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  });
}
