'use client';

import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ContactRow } from '@/features/contact/types/contact';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ContactTableProps {
  contacts: ContactRow[];
  replyingId?: string | null;
  canReply?: boolean;
  onReply: (contact: ContactRow) => void;
}

export function ContactTable({ contacts, replyingId = null, canReply = true, onReply }: ContactTableProps) {
  const { t } = useLocale();

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)] lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-start">
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.contacts.name')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.contacts.email')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.contacts.subject')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.contacts.status')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.contacts.receivedAt')}</th>
              <th className="px-5 py-4 text-end font-semibold text-gray-600">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-4 font-medium text-primary-dark">{contact.full_name}</td>
                <td className="px-5 py-4 text-gray-600">{contact.email}</td>
                <td className="max-w-xs px-5 py-4">
                  <p className="truncate font-medium text-gray-800">{contact.subject}</p>
                  <p className="truncate text-xs text-gray-400">{contact.message}</p>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                      contact.has_replied ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
                    )}
                  >
                    {contact.has_replied ? t('admin.contacts.replied') : t('admin.contacts.pending')}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500">{formatDateTime(contact.created_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    {!contact.has_replied && canReply ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={replyingId === contact.id}
                        onClick={() => onReply(contact)}
                      >
                        {replyingId === contact.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        {t('admin.contacts.reply')}
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
