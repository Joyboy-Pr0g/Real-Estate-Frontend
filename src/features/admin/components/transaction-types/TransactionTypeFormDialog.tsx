'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  createTransactionType,
  updateTransactionType,
} from '@/features/admin/services/admin-catalog-client';
import {
  AdminTransactionType,
  TRANSACTION_TYPE_NAMES,
  TransactionTypeName,
  TransactionTypePayload,
} from '@/features/admin/types/catalog';
import { buildPartialUpdate, hasPartialChanges } from '@/features/admin/lib/partial-update';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { IconPickerDropdown } from '@/features/admin/components/shared/IconPickerDropdown';

interface TransactionTypeFormDialogProps {
  open: boolean;
  item: AdminTransactionType | null;
  onClose: () => void;
  onSaved: () => void;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

export function TransactionTypeFormDialog({ open, item, onClose, onSaved }: TransactionTypeFormDialogProps) {
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<TransactionTypePayload>({
    name: 'for_sale',
    display_name_ar: '',
    icon: '',
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      name: item?.name ?? 'for_sale',
      display_name_ar: item?.display_name_ar ?? '',
      icon: item?.icon ?? '',
    });
  }, [open, item]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const next = {
          name: form.name,
          display_name_ar: form.display_name_ar.trim(),
          icon: form.icon.trim(),
        };

        if (item) {
          const original = {
            name: item.name,
            display_name_ar: item.display_name_ar,
            icon: item.icon,
          };
          const patch = buildPartialUpdate(next, original);

          if (!hasPartialChanges(patch)) {
            toast.info(t('admin.noChanges'));
            return;
          }

          await updateTransactionType(item.id, patch);
          toast.success(t('admin.transactionTypeUpdated'));
        } else {
          await createTransactionType(next);
          toast.success(t('admin.transactionTypeCreated'));
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
            {item ? t('admin.editTransactionType') : t('admin.createTransactionType')}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.transactionTypeName')}</span>
            <select
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value as TransactionTypeName })}
              className={fieldClass}
            >
              {TRANSACTION_TYPE_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.displayNameAr')}</span>
            <input
              required
              value={form.display_name_ar}
              onChange={(e) => setForm({ ...form, display_name_ar: e.target.value })}
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
