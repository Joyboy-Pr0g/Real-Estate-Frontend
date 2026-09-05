'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createSupportTicket } from '@/features/support-tickets/services/support-ticket-client';
import type { SupportTicketDetail } from '@/features/support-tickets/types/support-ticket';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getErrorMessage } from '@/lib/errors/api-error';
import { toast } from '@/components/ui/toaster';

interface CreateSupportTicketDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (ticket: SupportTicketDetail) => void;
}

export function CreateSupportTicketDialog({ open, onClose, onCreated }: CreateSupportTicketDialogProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subject.trim()) return;
    setSubmitting(true);
    try {
      const response = await createSupportTicket({
        subject: subject.trim(),
        content: content.trim() || undefined,
      });
      toast.success(t('dashboard.supportTickets.created'));
      setSubject('');
      setContent('');
      onClose();
      if (response.data) {
        onCreated?.(response.data);
        router.refresh();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]"
      >
        <h2 className="text-lg font-bold text-primary-dark">{t('dashboard.supportTickets.createTitle')}</h2>
        <p className="mt-1 text-sm text-gray-500">{t('dashboard.supportTickets.createHint')}</p>

        <label className="mt-4 block text-sm font-medium text-gray-700">
          {t('dashboard.supportTickets.subject')}
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            required
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </label>

        <label className="mt-3 block text-sm font-medium text-gray-700">
          {t('dashboard.supportTickets.initialMessage')}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={4000}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            {t('admin.cancel')}
          </Button>
          <Button type="submit" disabled={submitting || !subject.trim()}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {t('dashboard.supportTickets.create')}
          </Button>
        </div>
      </form>
    </div>
  );
}
