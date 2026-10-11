import { toast } from '@/components/ui/toaster';
import { dispatchNotificationsRefresh } from '@/features/notifications/services/notification-client';
import { parsePushPayload } from '@/lib/firebase/parse-push-payload';

type FcmPayload = {
  notification?: { title?: string; body?: string };
  data?: Record<string, string | undefined>;
};

export function handleFcmPush(payload: FcmPayload, options?: { showToast?: boolean }): void {
  dispatchNotificationsRefresh();

  const showToast = options?.showToast ?? true;
  if (!showToast) return;

  const parsed = parsePushPayload(payload);
  if (!parsed) return;

  toast.notification({
    title: parsed.title,
    message: parsed.message,
    href: parsed.href,
  });
}
