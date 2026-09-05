'use client';

import { AuthUser } from '@/features/auth/types/user';
import { PushTokenRegister } from '@/features/notifications/components/PushTokenRegister';
import { ForegroundMessageHandler } from '@/features/notifications/components/ForegroundMessageHandler';

interface NotificationProvidersProps {
  user: AuthUser;
}

export function NotificationProviders({ user }: NotificationProvidersProps) {
  return (
    <>
      <PushTokenRegister user={user} />
      <ForegroundMessageHandler />
    </>
  );
}
