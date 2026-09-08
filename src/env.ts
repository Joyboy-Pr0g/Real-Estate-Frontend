import { z } from 'zod';

const envSchema = z.object({
  BACKEND_URL: z.string().url().default('http://localhost:3000/api'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url().optional(),
  NEXT_PUBLIC_IS_PRODUCTION: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  BACKEND_URL: process.env.BACKEND_URL,
  NEXT_PUBLIC_APP_URL: process.env.APP_URL,
  NEXT_PUBLIC_SITE_URL: process.env.SITE_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.SOCKET_URL,
  NEXT_PUBLIC_IS_PRODUCTION: process.env.IS_PRODUCTION,
  NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.GOOGLE_MAPS_KEY,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.FIREBASE_VAPID_KEY,
});
