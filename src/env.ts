import { z } from 'zod';

const envSchema = z.object({
  BACKEND_URL: z.string().url().default('http://localhost:3000/api'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export const env = envSchema.parse({
  BACKEND_URL: process.env.BACKEND_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
