'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileUploadField } from '@/components/ui/file-upload-field';
import { toast } from '@/components/ui/toaster';
import { applyAsIndividualLister } from '@/features/individual-lister/services/individual-lister-client';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';

interface IndividualApplicationFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export function IndividualApplicationForm({ onCancel, onSuccess }: IndividualApplicationFormProps) {
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
      onSuccess?.();
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <FileUploadField
        label={t('dashboard.individual.idPhoto')}
        accept="image/jpeg,image/png,image/webp,application/pdf"
        required
        value={file}
        onChange={setFile}
      />

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
