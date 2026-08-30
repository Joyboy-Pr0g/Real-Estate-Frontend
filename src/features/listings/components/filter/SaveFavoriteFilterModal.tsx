'use client';

import { Bookmark } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { createFavoriteFilter } from '@/features/listings/services/favorite-filter-client';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';

interface SaveFavoriteFilterModalProps {
  open: boolean;
  filters: Record<string, string>;
  onClose: () => void;
}

export function SaveFavoriteFilterModal({ open, filters, onClose }: SaveFavoriteFilterModalProps) {
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await createFavoriteFilter({
        name: name.trim(),
        filters,
        email_notifications: emailNotifications,
      });
      toast.success(t('filters.saveFilterSuccess'));
      setName('');
      setEmailNotifications(false);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t('filters.closeSpec')}
        className="absolute inset-0 bg-primary-dark/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Bookmark className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-primary-dark">{t('filters.saveFilterTitle')}</h2>
            <p className="text-xs text-gray-500">{t('filters.saveFilterHint')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="filter_name" className="text-sm font-medium text-primary-dark">
              {t('filters.saveFilterName')}
            </label>
            <input
              id="filter_name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              required
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/15"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) => setEmailNotifications(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand/30"
            />
            <span className="text-sm leading-6 text-gray-600">{t('filters.saveFilterEmailOptIn')}</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? t('dashboard.saving') : t('filters.saveFilterSubmit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
