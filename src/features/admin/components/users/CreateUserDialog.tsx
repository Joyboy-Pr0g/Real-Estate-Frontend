'use client';

import { ChangeEvent, FormEvent, useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createAdminUser } from '@/features/auth/services/auth-service';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { CreateUserPayload, UserRole } from '@/features/auth/types/user';
import { formatPhoneNumber } from '@/lib/utils/format';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateUserDialog({ open, onClose, onCreated }: CreateUserDialogProps) {
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserPayload>({
    f_name: '',
    l_name: '',
    email: '',
    phone_number: '',
    role: 'buyer',
  });

  if (!open) return null;

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, phone_number: formatPhoneNumber(value) });
  }

  const validateForm = () => {
    if (!formData.f_name) {
      setError(t('admin.firstNameRequired'));
      return false;
    }
    if (!formData.l_name) {
      setError(t('admin.lastNameRequired'));
      return false;
    }
    if (!formData.email) {
      setError(t('admin.emailRequired'));
      return false;
    }
    if (!formData.phone_number) {
      setError(t('admin.phoneRequired'));
      return false;
    }
    if (!formData.role) {
      setError(t('admin.roleRequired'));
      return false;
    }
    return true;
  }

  const resetForm = () => {
    setFormData({
      f_name: '',
      l_name: '',
      email: '',
      phone_number: '',
      role: 'buyer',
    });
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;
    setError(null);
    startTransition(async () => {
      try {
        await createAdminUser({
          f_name: formData.f_name ?? '',
          l_name: formData.l_name ?? '',
          email: formData.email ?? '',
          phone_number: formData.phone_number ?? '',
          role: formData.role ?? 'buyer',
        });
        toast.success(t('admin.userCreated'));
        onCreated();
        onClose();
        resetForm();
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error(message);
      }
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]">
        <div className="relative">
          <button
            type="button"
            onClick={handleClose}
            disabled={pending}
            aria-label={t('admin.close')}
            className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="ps-10 text-lg font-bold text-primary-dark">{t('admin.createUserTitle')}</h2>
          <p className="mt-1 ps-10 text-sm text-gray-500">{t('admin.createUserHint')}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-medium text-gray-500">{t('admin.firstName')}</span>
              <input
                name="f_name"
                value={formData.f_name}
                onChange={(e) => setFormData({ ...formData, f_name: e.target.value })}
                required
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-gray-500">{t('admin.lastName')}</span>
              <input name="l_name" value={formData.l_name} onChange={(e) => setFormData({ ...formData, l_name: e.target.value })} required className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm" />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-gray-500">{t('admin.email')}</span>
            <input name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} type="email" required className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-gray-500">{t('admin.phone')}</span>
              <input
                dir="ltr"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handlePhoneNumberChange}
                required
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-gray-500">{t('admin.userRole')}</span>
              <select name="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} required className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm">
                <option value="buyer">{t('admin.role.buyer')}</option>
                <option value="office">{t('admin.role.office')}</option>
                <option value="platform_admin">{t('admin.role.platform_admin')}</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>              {t('admin.cancel')}
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
