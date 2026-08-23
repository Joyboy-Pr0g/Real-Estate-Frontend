'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { applyAsIndividualLister } from '@/features/individual-lister/services/individual-lister-client';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';

interface IndividualApplicationFormProps {
  onCancel: () => void;
}

const fileClass =
  'block w-full text-sm text-gray-600 file:me-3 file:rounded-lg file:border-0 file:bg-brand-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-dark';

export function IndividualApplicationForm({ onCancel }: IndividualApplicationFormProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!file) {
      toast.error(t('dashboard.office.filesRequired'));
      return;
    }

    setSubmitting(true);
    try {
      await applyAsIndividualLister(file);
      toast.success(t('dashboard.applicationSubmitted'));
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-primary-dark">{t('dashboard.individual.idPhoto')}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className={fileClass}
        />
      </label>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          {t('admin.cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? t('dashboard.submitting') : t('dashboard.submit')}
        </Button>
      </div>
    </form>
  );
}
