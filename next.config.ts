import type { NextConfig } from 'next';

function resolvePublicSocketUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SOCKET_URL?.trim() ?? process.env.SOCKET_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const backend =
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ??
    process.env.BACKEND_URL?.trim() ??
    'https://api.yemen-land.com/api';
  return backend.replace(/\/api\/?$/, '') || 'https://api.yemen-land.com';
}

function resolvePublicGoogleMapsKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY?.trim() ??
    process.env.GOOGLE_MAPS_KEY?.trim() ??
    ''
  );
}

function resolvePublicTurnstileSiteKey(): string {
  return (
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ??
    process.env.TURNSTILE_SITE_KEY?.trim() ??
    ''
  );
}

/** Firebase web config must be inlined for client bundles; `FIREBASE_*` alone is server-only. */
function resolvePublicFirebaseEnv(): Record<string, string> {
  const pick = (nextKey: string, fallbackKey: string) =>
    (process.env[nextKey]?.trim() ?? process.env[fallbackKey]?.trim() ?? '');

  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: pick('NEXT_PUBLIC_FIREBASE_API_KEY', 'FIREBASE_API_KEY'),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: pick('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'FIREBASE_AUTH_DOMAIN'),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: pick('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID'),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: pick(
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'FIREBASE_STORAGE_BUCKET',
    ),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: pick(
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_MESSAGING_SENDER_ID',
    ),
    NEXT_PUBLIC_FIREBASE_APP_ID: pick('NEXT_PUBLIC_FIREBASE_APP_ID', 'FIREBASE_APP_ID'),
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: pick('NEXT_PUBLIC_FIREBASE_VAPID_KEY', 'FIREBASE_VAPID_KEY'),
  };
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SOCKET_URL: resolvePublicSocketUrl(),
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: resolvePublicGoogleMapsKey(),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: resolvePublicTurnstileSiteKey(),
    ...resolvePublicFirebaseEnv(),
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    return [
      { source: '/favicon.ico', destination: '/favicon/favicon.ico' },
      { source: '/apple-touch-icon.png', destination: '/favicon/apple-touch-icon.png' },
      { source: '/site.webmanifest', destination: '/favicon/site.webmanifest' },
    ];
  },
};

export default nextConfig;
