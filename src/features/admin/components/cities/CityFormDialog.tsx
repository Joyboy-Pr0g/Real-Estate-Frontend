'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createCity, updateCity } from '@/features/admin/services/admin-locations-client';
import { buildPartialUpdate, hasPartialChanges } from '@/features/admin/lib/partial-update';
import { AdminCity, CityFormFields } from '@/features/admin/types/locations';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';

interface CityFormDialogProps {
  open: boolean;
  item: AdminCity | null;
  onClose: () => void;
  onSaved: () => void;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

export function CityFormDialog({ open, item, onClose, onSaved }: CityFormDialogProps) {
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<CityFormFields>({ name: '', governorate: '', pcode: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: item?.name ?? '',
      governorate: item?.governorate ?? '',
      pcode: item?.pcode ?? '',
    });
    setPhotoFile(null);
    setPhotoPreview(item?.city_photo.url ?? null);
  }, [open, item]);

  if (!open) return null;

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(item?.city_photo.url ?? null);
    }
  };

  const buildFormData = (fields: Partial<CityFormFields>, file: File | null): FormData => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) formData.append(key, value);
    }
    if (file) formData.append('city_photo', file);
    return formData;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const next = {
          name: form.name.trim(),
          governorate: form.governorate.trim(),
          pcode: form.pcode.trim(),
        };

        if (item) {
          const original = {
            name: item.name,
            governorate: item.governorate,
            pcode: item.pcode,
          };
          const patch = buildPartialUpdate(next, original);

          if (!hasPartialChanges(patch) && !photoFile) {
            toast.info(t('admin.noChanges'));
            return;
          }

          await updateCity(item.id, buildFormData(patch, photoFile));
          toast.success(t('admin.cityUpdated'));
        } else {
          if (!photoFile) {
            toast.error(t('admin.cityPhotoRequired'));
            return;
          }
          await createCity(buildFormData(next, photoFile));
          toast.success(t('admin.cityCreated'));
        }

        onSaved();
        onClose();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]">
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label={t('admin.close')}
            className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="ps-10 text-lg font-bold text-primary-dark">
            {item ? t('admin.editCity') : t('admin.createCity')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.catalogName')}</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.governorate')}</span>
            <input
              required
              value={form.governorate}
              onChange={(e) => setForm({ ...form, governorate: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.cityPcode')}</span>
            <input
              required
              value={form.pcode}
              onChange={(e) => setForm({ ...form, pcode: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.cityPhoto')}</span>
            {photoPreview ? (
              <Image
                src={photoPreview}
                alt=""
                width={120}
                height={120}
                className="mb-2 h-28 w-28 rounded-xl object-cover"
              />
            ) : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!item}
              onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:me-3 file:rounded-lg file:border-0 file:bg-brand-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-dark"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {t('admin.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
