'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LifeBuoy, Loader2, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { Button } from '@/components/ui/button';
import { SupportTicketTable } from '@/features/support-tickets/components/SupportTicketTable';
import { SupportTicketCard } from '@/features/support-tickets/components/SupportTicketCard';
import { SupportTicketChatDialog } from '@/features/support-tickets/components/SupportTicketChatDialog';
import { AdminSupportTicketChatWindow } from '@/features/admin/components/support-tickets/AdminSupportTicketChatWindow';
import {
  fetchAdminSupportTicket,
  fetchAdminSupportTickets,
} from '@/features/admin/services/admin-support-tickets-client';
import type {
  SupportTicketDetail,
  SupportTicketInboxRow,
  SupportTicketsPage,
  SupportTicketStatus,
} from '@/features/support-tickets/types/support-ticket';
import { formatTicketStatusKey } from '@/features/support-tickets/components/support-ticket-utils';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { getErrorMessage } from '@/lib/errors/api-error';
import { toast } from '@/components/ui/toaster';
import { AuthUser } from '@/features/auth/types/user';

const STATUSES: SupportTicketStatus[] = ['pending', 'in_progress', 'resolved', 'closed'];

interface AdminSupportTicketsPanelProps {
  user: AuthUser;
  initial: SupportTicketsPage;
  initialStatus?: SupportTicketStatus | '';
  initialSearch?: string;
}

export function AdminSupportTicketsPanel({
  user,
  initial,
  initialStatus = '',
  initialSearch = '',
}: AdminSupportTicketsPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [tickets, setTickets] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [openingTicketId, setOpeningTicketId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SupportTicketDetail | null>(null);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setTickets(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
  }

  const applyFilters = useCallback(
    (status: string, search: string) => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
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
    applyFilters(statusFilter, debouncedSearch);
  }, [statusFilter, debouncedSearch, applyFilters]);

  const refreshList = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const loadMore = () => {
    if (!nextCursor) return;
    startTransition(async () => {
      const params: Record<string, string> = { cursor: nextCursor, limit: '50' };
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const page = await fetchAdminSupportTickets(params);
      setTickets((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  const handleOpenTicket = async (row: SupportTicketInboxRow) => {
    setOpeningTicketId(row.id);
    try {
      const response = await fetchAdminSupportTicket(row.id);
      if (!response.data) {
        toast.error(t('admin.supportTickets.notFound'));
        return;
      }
      setActiveTicket(response.data);
      setChatOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setOpeningTicketId(null);
    }
  };

  const handleStatusUpdated = (ticket: SupportTicketDetail) => {
    setActiveTicket(ticket);
    setTickets((prev) =>
      prev.map((item) =>
        item.id === ticket.id
          ? {
              ...item,
              status: ticket.status,
              last_message_at: ticket.last_message_at,
              last_message_preview: ticket.last_message_preview,
            }
          : item,
      ),
    );
  };

  const handleDeleted = () => {
    if (activeTicket) {
      setTickets((prev) => prev.filter((item) => item.id !== activeTicket.id));
    }
    setChatOpen(false);
    setActiveTicket(null);
    refreshList();
  };

  const closeChat = () => {
    setChatOpen(false);
    setActiveTicket(null);
  };

  return (
    <div className={cn('space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.supportTickets.title', icon: LifeBuoy },
        ]}
        title={t('admin.supportTickets.title')}
        countLabel={t('admin.usersCount').replace('{count}', String(tickets.length))}
        filters={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-xl">
              <Search size={16} className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('admin.supportTickets.searchPlaceholder')}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 ps-9 pe-3 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SupportTicketStatus | '')}
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand/40"
            >
              <option value="">{t('admin.allStatuses')}</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(formatTicketStatusKey(status))}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-gray-500">{t('admin.supportTickets.empty')}</p>
        </div>
      ) : (
        <>
          <SupportTicketTable
            tickets={tickets}
            showRequester
            openingTicketId={openingTicketId}
            onOpenTicket={(ticket) => void handleOpenTicket(ticket)}
          />
          <div className="space-y-3 lg:hidden">
            {tickets.map((ticket) => (
              <SupportTicketCard
                key={ticket.id}
                ticket={ticket}
                showRequester
                openingTicketId={openingTicketId}
                onOpenTicket={(item) => void handleOpenTicket(item)}
              />
            ))}
          </div>
        </>
      )}

      {hasMore ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isPending} className="rounded-xl">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('admin.loadMore')}
          </Button>
        </div>
      ) : null}

      <SupportTicketChatDialog
        open={chatOpen && activeTicket !== null}
        title={activeTicket?.subject ?? ''}
        onClose={closeChat}
      >
        {activeTicket ? (
          <AdminSupportTicketChatWindow
            ticket={activeTicket}
            adminUserId={user.id}
            embedded
            onClose={closeChat}
            onDeleted={handleDeleted}
            onStatusUpdated={handleStatusUpdated}
          />
        ) : null}
      </SupportTicketChatDialog>
    </div>
  );
}
