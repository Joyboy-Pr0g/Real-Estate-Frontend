'use client';

import { X } from 'lucide-react';
import type { SocketNotificationPayload } from '@/features/messaging/types/messaging';
import { useLocale } from '@/lib/i18n/locale-provider';

interface InAppMessageNotificationProps {
  payload: SocketNotificationPayload;
  onDismiss: () => void;
  onOpen: () => void;
}

export function InAppMessageNotification({ payload, onDismiss, onOpen }: InAppMessageNotificationProps) {
  const { t } = useLocale();

  return (
    <div className="fixed bottom-4 end-4 z-[100] w-[min(100vw-2rem,22rem)] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-start">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">{t('dashboard.messages.notificationTitle')}</p>
          <p className="mt-1 truncate text-sm font-bold text-primary-dark">{payload.listingTitle}</p>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{payload.preview}</p>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label={t('admin.close')}
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
