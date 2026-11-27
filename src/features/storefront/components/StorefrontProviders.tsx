'use client';

import { MessagingSocketProvider } from '@/features/messaging/providers/MessagingSocketProvider';
import {
  StorefrontSessionProvider,
  useStorefrontSession,
} from '@/features/storefront/providers/StorefrontSessionProvider';

function StorefrontMessaging({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStorefrontSession();
  return <MessagingSocketProvider enabled={isAuthenticated}>{children}</MessagingSocketProvider>;
}

export function StorefrontProviders({ children }: { children: React.ReactNode }) {
  return (
    <StorefrontSessionProvider>
      <StorefrontMessaging>{children}</StorefrontMessaging>
    </StorefrontSessionProvider>
  );
}
