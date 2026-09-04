'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { reportListing, type ListingReportReason } from '@/features/listings/services/listing-client';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';

const REASONS: ListingReportReason[] = [
  'misleading_info',
  'fraud',
  'duplicate',
  'inappropriate_content',
  'other',
];

interface ListingReportModalProps {
  open: boolean;
  listingId: string;
  listingTitle: string;
  onClose: () => void;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

export function ListingReportModal({ open, listingId, listingTitle, onClose }: ListingReportModalProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [reason, setReason] = useState<ListingReportReason>('misleading_info');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    setReason('misleading_info');
    setDescription('');
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await reportListing(listingId, {
        reason,
        description: description.trim() || undefined,
      });
      toast.success(t('dashboard.report.submitted'));
      resetAndClose();
      router.push('/dashboard/reports');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        role="dialog"
        aria-modal="true"
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]"
      >
        <h2 className="text-lg font-bold text-primary-dark">{t('dashboard.report.title')}</h2>
        <p className="mt-1 text-sm text-gray-500">{t('dashboard.report.hint')}</p>
        <p className="mt-2 truncate text-sm font-medium text-primary-dark">{listingTitle}</p>

        <div className="mt-5 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.report.reasonLabel')}</span>
            <select
              required
              value={reason}
              onChange={(e) => setReason(e.target.value as ListingReportReason)}
              className={fieldClass}
            >
              {REASONS.map((value) => (
                <option key={value} value={value}>
                  {t(`dashboard.report.reason.${value}` as TranslationKey)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.report.descriptionLabel')}</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('dashboard.report.descriptionPlaceholder')}
              className={`${fieldClass} min-h-28 py-2.5`}
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={resetAndClose} disabled={submitting}>
            {t('admin.cancel')}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? t('dashboard.submitting') : t('dashboard.report.submit')}
          </Button>
        </div>
      </form>
    </div>
  );
}
