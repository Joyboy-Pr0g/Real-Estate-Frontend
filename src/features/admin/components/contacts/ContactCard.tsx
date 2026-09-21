'use client';

import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ContactRow } from '@/features/contact/types/contact';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ContactCardProps {
  contact: ContactRow;
  replying?: boolean;
  canReply?: boolean;
  onReply: (contact: ContactRow) => void;
}

export function ContactCard({ contact, replying = false, canReply = true, onReply }: ContactCardProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[var(--shadow-soft)] lg:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-primary-dark">{contact.full_name}</p>
          <p className="text-xs text-gray-500">{contact.email}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
            contact.has_replied ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
          )}
        >
          {contact.has_replied ? t('admin.contacts.replied') : t('admin.contacts.pending')}
        </span>
      </div>
      <p className="mt-3 font-medium text-gray-800">{contact.subject}</p>
      <p className="mt-1 line-clamp-3 text-sm text-gray-600">{contact.message}</p>
      <p className="mt-3 text-xs text-gray-400">{formatDateTime(contact.created_at)}</p>
      {!contact.has_replied && canReply ? (
        <Button type="button" size="sm" variant="outline" className="mt-4 w-full" disabled={replying} onClick={() => onReply(contact)}>
          {replying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {t('admin.contacts.reply')}
        </Button>
      ) : null}
    </article>
  );
}
