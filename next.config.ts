import type { NextConfig } from 'next';
import { env } from '@/env';

function resolvePublicSocketUrl(): string {
  const explicit = env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const backend = env.BACKEND_URL?.trim() || 'http://localhost:3000/api';
  return backend.replace(/\/api\/?$/, '') || 'http://localhost:3000';
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
};

export default nextConfig;
