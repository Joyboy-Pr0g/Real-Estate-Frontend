import type { NextConfig } from 'next';
import { env } from '@/env';

function resolvePublicSocketUrl(): string {
  const explicit = env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const backend = env.BACKEND_URL?.trim() || 'http://localhost:3000/api';
  return backend.replace(/\/api\/?$/, '') || 'http://localhost:3000';
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SOCKET_URL: resolvePublicSocketUrl(),
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
