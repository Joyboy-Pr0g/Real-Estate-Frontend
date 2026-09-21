'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Loader2, Mail } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { Button } from '@/components/ui/button';
import { ContactTable } from '@/features/admin/components/contacts/ContactTable';
import { ContactCard } from '@/features/admin/components/contacts/ContactCard';
import { ContactReplyModal } from '@/features/admin/components/contacts/ContactReplyModal';
import { fetchAdminContacts, replyToContact } from '@/features/admin/services/admin-contacts-client';
import type { ContactRow, ContactsPage } from '@/features/contact/types/contact';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { getErrorMessage } from '@/lib/errors/api-error';
import { toast } from '@/components/ui/toaster';

type ReplyFilter = '' | 'true' | 'false';

interface AdminContactsPanelProps {
  initial: ContactsPage;
  initialFullName?: string;
  initialEmail?: string;
  initialSubject?: string;
  initialHasReplied?: ReplyFilter;
}

export function AdminContactsPanel({
  initial,
  initialFullName = '',
  initialEmail = '',
  initialSubject = '',
  initialHasReplied = '',
}: AdminContactsPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const canReply = hasPermission('contacts.reply');
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [contacts, setContacts] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [fullNameInput, setFullNameInput] = useState(initialFullName);
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [subjectInput, setSubjectInput] = useState(initialSubject);
  const [hasRepliedFilter, setHasRepliedFilter] = useState<ReplyFilter>(initialHasReplied);
  const debouncedFullName = useDebounce(fullNameInput, 400);
  const debouncedEmail = useDebounce(emailInput, 400);
  const debouncedSubject = useDebounce(subjectInput, 400);

  const [replyOpen, setReplyOpen] = useState(false);
  const [activeContact, setActiveContact] = useState<ContactRow | null>(null);
  const [replying, setReplying] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setContacts(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
  }

  const applyFilters = useCallback(
    (fullName: string, email: string, subject: string, hasReplied: ReplyFilter) => {
      const params = new URLSearchParams();
      if (fullName.trim()) params.set('full_name', fullName.trim());
      if (email.trim()) params.set('email', email.trim());
      if (subject.trim()) params.set('subject', subject.trim());
      if (hasReplied) params.set('has_replied', hasReplied);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router],
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    applyFilters(debouncedFullName, debouncedEmail, debouncedSubject, hasRepliedFilter);
  }, [debouncedFullName, debouncedEmail, debouncedSubject, hasRepliedFilter, applyFilters]);

  const loadMore = () => {
    if (!nextCursor) return;
    startTransition(async () => {
      const params: Record<string, string> = { cursor: nextCursor, limit: '50' };
      if (debouncedFullName.trim()) params.full_name = debouncedFullName.trim();
      if (debouncedEmail.trim()) params.email = debouncedEmail.trim();
      if (debouncedSubject.trim()) params.subject = debouncedSubject.trim();
      if (hasRepliedFilter) params.has_replied = hasRepliedFilter;
      const page = await fetchAdminContacts(params);
      setContacts((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  const handleOpenReply = (contact: ContactRow) => {
    setOpeningId(contact.id);
    setActiveContact(contact);
    setReplyOpen(true);
    setOpeningId(null);
  };

  const handleSendReply = async (replyMessage: string) => {
    if (!activeContact) return;
    setReplying(true);
    try {
      const response = await replyToContact(activeContact.id, { reply_message: replyMessage });
      if (response.data) {
        setContacts((prev) => prev.map((item) => (item.id === response.data!.id ? response.data! : item)));
        toast.success(t('admin.contacts.replySent'));
        setReplyOpen(false);
        setActiveContact(null);
        startTransition(() => router.refresh());
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.dashboard', href: '/admin', icon: LayoutDashboard },
          { labelKey: 'admin.contacts.title', icon: Mail },
        ]}
        title={t('admin.contacts.title')}
        countLabel={t('admin.contacts.count').replace('{count}', String(contacts.length))}
        filters={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={fullNameInput}
              onChange={(e) => setFullNameInput(e.target.value)}
              placeholder={t('admin.contacts.filterName')}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={t('admin.contacts.filterEmail')}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <input
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              placeholder={t('admin.contacts.filterSubject')}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <select
              value={hasRepliedFilter}
              onChange={(e) => setHasRepliedFilter(e.target.value as ReplyFilter)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
            >
              <option value="">{t('admin.contacts.allStatuses')}</option>
              <option value="false">{t('admin.contacts.pending')}</option>
              <option value="true">{t('admin.contacts.replied')}</option>
            </select>
          </div>
        }
      />

      <p className="text-sm text-gray-500">{t('admin.contacts.hint')}</p>

      {contacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center text-sm text-gray-500">
          {t('admin.contacts.empty')}
        </div>
      ) : (
        <>
          <ContactTable
            contacts={contacts}
            replyingId={openingId}
            canReply={canReply}
            onReply={handleOpenReply}
          />
          <div className="space-y-4 lg:hidden">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                replying={openingId === contact.id}
                canReply={canReply}
                onReply={handleOpenReply}
              />
            ))}
          </div>
        </>
      )}

      {hasMore ? (
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={loadMore} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('admin.loadMore')}
          </Button>
        </div>
      ) : null}

      <ContactReplyModal
        open={replyOpen}
        contact={activeContact}
        loading={replying}
        onConfirm={(message) => void handleSendReply(message)}
        onCancel={() => {
          if (replying) return;
          setReplyOpen(false);
          setActiveContact(null);
        }}
      />
    </div>
  );
}
