'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  loading?: boolean;
  danger?: boolean;
  showCannotUndo?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmText,
  cancelText,
  loading = false,
  danger = false,
  showCannotUndo = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useLocale();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]"
      >
        <h2 className="text-lg font-bold text-primary-dark">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        {showCannotUndo ? (
          <p className="mt-2 text-xs text-gray-400">{t('admin.confirmCannotUndo')}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            variant={danger ? 'danger' : 'primary'}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
