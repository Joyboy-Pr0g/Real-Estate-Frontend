'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';

interface SupportTicketChatDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function SupportTicketChatDialog({ open, title, onClose, children }: SupportTicketChatDialogProps) {
  const { t } = useLocale();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden rounded-none bg-white shadow-[var(--shadow-float)] sm:h-[min(85vh,720px)] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="truncate pe-4 text-base font-bold text-primary-dark">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label={t('admin.cancel')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
