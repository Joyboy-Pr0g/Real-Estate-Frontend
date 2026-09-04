'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUploadField } from '@/components/ui/file-upload-field';
import { updateListingHistoryDetails } from '@/features/listings/services/listing-client';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { toast } from '@/components/ui/toaster';

interface ListingHistoryDetailsModalProps {
  open: boolean;
  listingId: string;
  action: 'sold' | 'rented';
  onClose: () => void;
  onComplete: () => void;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

export function ListingHistoryDetailsModal({
  open,
  listingId,
  action,
  onClose,
  onComplete,
}: ListingHistoryDetailsModalProps) {
  const { t } = useLocale();
  const [holderName, setHolderName] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [contractPhoto, setContractPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    setHolderName('');
    setContractNumber('');
    setNotes('');
    setContractPhoto(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (holderName.trim()) formData.append('new_house_holder_name', holderName.trim());
      if (contractNumber.trim()) formData.append('contract_number', contractNumber.trim());
      if (notes.trim()) formData.append('notes', notes.trim());
      if (contractPhoto) formData.append('contract_photo', contractPhoto);
      await updateListingHistoryDetails(listingId, formData);
      toast.success(t('dashboard.listings.historySaved'));
      resetAndClose();
      onComplete();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]">
        <h2 className="text-lg font-bold text-primary-dark">
          {action === 'sold' ? t('dashboard.listings.soldDetailsTitle') : t('dashboard.listings.rentedDetailsTitle')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{t('dashboard.listings.historyDetailsHint')}</p>

        <div className="mt-5 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.holderName')}</span>
            <input value={holderName} onChange={(e) => setHolderName(e.target.value)} className={fieldClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.contractNumber')}</span>
            <input value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} className={fieldClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.notes')}</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${fieldClass} min-h-24 py-2.5`}
            />
          </label>
          <FileUploadField
            label={t('dashboard.listings.contractPhoto')}
            accept="image/jpeg,image/png,image/webp"
            value={contractPhoto}
            onChange={setContractPhoto}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={resetAndClose} disabled={submitting}>
            {t('admin.cancel')}
          </Button>
          <Button type="button" variant="outline" onClick={() => { resetAndClose(); onComplete(); }} disabled={submitting}>
            {t('dashboard.listings.skipDetails')}
          </Button>
          <Button type="button" disabled={submitting} onClick={(event) => void handleSubmit(event as unknown as FormEvent)}>
            {submitting ? t('dashboard.submitting') : t('dashboard.submit')}
          </Button>
        </div>
      </div>
    </div>
  );
}
