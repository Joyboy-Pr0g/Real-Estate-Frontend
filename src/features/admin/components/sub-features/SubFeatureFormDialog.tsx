'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  createSubFeature,
  updateSubFeature,
} from '@/features/admin/services/admin-features-client';
import { buildPartialUpdate, hasPartialChanges } from '@/features/admin/lib/partial-update';
import {
  AdminMainFeature,
  AdminSubFeature,
  SubFeaturePayload,
} from '@/features/admin/types/features';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { IconPickerDropdown } from '@/features/admin/components/shared/IconPickerDropdown';

interface SubFeatureFormDialogProps {
  open: boolean;
  item: AdminSubFeature | null;
  mainFeatures: AdminMainFeature[];
  defaultMainFeatureId?: string;
  onClose: () => void;
  onSaved: () => void;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

const emptyForm = (mainFeatureId: string): SubFeaturePayload => ({
  name: '',
  icon: '',
  order: 1,
  main_feature_id: mainFeatureId,
});

function toPayload(item: AdminSubFeature): SubFeaturePayload {
  return {
    name: item.name,
    icon: item.icon,
    order: item.order,
    main_feature_id: item.main_feature_id,
  };
}

export function SubFeatureFormDialog({
  open,
  item,
  mainFeatures,
  defaultMainFeatureId = '',
  onClose,
  onSaved,
}: SubFeatureFormDialogProps) {
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();
  const fallbackMainId = defaultMainFeatureId || mainFeatures[0]?.id || '';
  const [form, setForm] = useState<SubFeaturePayload>(emptyForm(fallbackMainId));

  useEffect(() => {
    if (!open) return;
    if (item) {
      setForm(toPayload(item));
    } else {
      setForm(emptyForm(fallbackMainId));
    }
  }, [open, item, fallbackMainId]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const next: SubFeaturePayload = {
          name: form.name.trim(),
          icon: form.icon.trim(),
          order: form.order,
          main_feature_id: form.main_feature_id,
        };

        if (item) {
          const patch = buildPartialUpdate(next, toPayload(item));
          if (!hasPartialChanges(patch)) {
            toast.info(t('admin.noChanges'));
            return;
          }
          await updateSubFeature(item.id, patch);
          toast.success(t('admin.subFeatureUpdated'));
        } else {
          await createSubFeature(next);
          toast.success(t('admin.subFeatureCreated'));
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
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]">
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
            {item ? t('admin.editSubFeature') : t('admin.createSubFeature')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.mainFeature')}</span>
            <select
              required
              value={form.main_feature_id}
              onChange={(e) => setForm({ ...form, main_feature_id: e.target.value })}
              className={fieldClass}
            >
              {mainFeatures.map((feature) => (
                <option key={feature.id} value={feature.id}>
                  {feature.name}
                </option>
              ))}
            </select>
          </label>
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
            <span className="text-sm font-medium text-primary-dark">{t('admin.catalogIcon')}</span>
            <IconPickerDropdown
              required
              value={form.icon}
              onChange={(icon) => setForm({ ...form, icon })}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.featureOrder')}</span>
            <input
              type="number"
              required
              min={1}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 1 })}
              className={fieldClass}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={pending || mainFeatures.length === 0}>
              {t('admin.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
