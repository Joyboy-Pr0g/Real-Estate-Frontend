'use client';

import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ContactRow } from '@/features/contact/types/contact';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ContactReplyModalProps {
  open: boolean;
  contact: ContactRow | null;
  loading?: boolean;
  onConfirm: (replyMessage: string) => void;
  onCancel: () => void;
}

export function ContactReplyModal({
  open,
  contact,
  loading = false,
  onConfirm,
  onCancel,
}: ContactReplyModalProps) {
  const { t } = useLocale();
  const [replyMessage, setReplyMessage] = useState('');

  if (!open || !contact) return null;

  const handleConfirm = () => {
    if (replyMessage.trim().length < 1) return;
    onConfirm(replyMessage.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Mail className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-primary-dark">{t('admin.contacts.replyTitle')}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {contact.full_name} · {contact.email}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm">
          <p className="font-semibold text-primary-dark">{contact.subject}</p>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed text-gray-600">{contact.message}</p>
        </div>

        <label className="mt-4 block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('admin.contacts.replyMessage')}</span>
          <textarea
            required
            rows={4}
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            maxLength={4000}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-brand/40 focus:bg-white"
          />
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {t('admin.cancel')}
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={loading || replyMessage.trim().length < 1}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {t('admin.contacts.sendReply')}
          </Button>
        </div>
      </div>
    </div>
  );
}
