import type { NextConfig } from 'next';
import { env } from '@/env';

function resolvePublicSocketUrl(): string {
  const explicit = env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const backend = env.BACKEND_URL?.trim() || 'https://api.yemen-land.com/api';
  return backend.replace(/\/api\/?$/, '') || 'https://api.yemen-land.com';
}

function resolvePublicGoogleMapsKey(): string {
  const explicit = env.NEXT_PUBLIC_GOOGLE_MAPS_KEY?.trim();
  if (explicit) return explicit;

  const legacy = env.NEXT_PUBLIC_GOOGLE_MAPS_KEY?.trim();
  return legacy ?? '';
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SOCKET_URL: resolvePublicSocketUrl(),
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: resolvePublicGoogleMapsKey(),
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
