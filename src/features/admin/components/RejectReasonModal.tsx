'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-provider';

interface RejectReasonModalProps {
  open: boolean;
  title: string;
  loading?: boolean;
  confirmLabel?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function RejectReasonModal({
  open,
  title,
  loading = false,
  confirmLabel,
  onConfirm,
  onCancel,
}: RejectReasonModalProps) {
  const { t } = useLocale();
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    if (reason.trim().length < 2) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]">
        <h2 className="text-lg font-bold text-primary-dark">{title}</h2>

        <label className="mt-4 block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('admin.rejectReason')}</span>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-brand/40 focus:bg-white"
          />
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {t('admin.cancel')}
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={loading || reason.trim().length < 2} variant="danger">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmLabel ?? t('admin.reject')}
          </Button>
        </div>
      </div>
    </div>
  );
}
