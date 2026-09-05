'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LifeBuoy, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SupportTicketTable } from '@/features/support-tickets/components/SupportTicketTable';
import { SupportTicketCard } from '@/features/support-tickets/components/SupportTicketCard';
import { SupportTicketChatDialog } from '@/features/support-tickets/components/SupportTicketChatDialog';
import { SupportTicketChatWindow } from '@/features/support-tickets/components/SupportTicketChatWindow';
import { CreateSupportTicketDialog } from '@/features/support-tickets/components/CreateSupportTicketDialog';
import {
  fetchSupportTicket,
  fetchSupportTickets,
} from '@/features/support-tickets/services/support-ticket-client';
import type {
  CanCreateTicketResult,
  SupportTicketDetail,
  SupportTicketInboxRow,
  SupportTicketsPage,
} from '@/features/support-tickets/types/support-ticket';
import { AuthUser } from '@/features/auth/types/user';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getErrorMessage } from '@/lib/errors/api-error';
import { toast } from '@/components/ui/toaster';

interface SupportTicketsPanelProps {
  user: AuthUser;
  initial: SupportTicketsPage;
  canCreate: CanCreateTicketResult;
}

export function SupportTicketsPanel({ user, initial, canCreate }: SupportTicketsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tickets, setTickets] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [createOpen, setCreateOpen] = useState(false);
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

  const refreshList = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const loadMore = () => {
    if (!nextCursor) return;
    startTransition(async () => {
      const page = await fetchSupportTickets({ cursor: nextCursor, limit: '50' });
      setTickets((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  const handleOpenTicket = async (row: SupportTicketInboxRow) => {
    setOpeningTicketId(row.id);
    try {
      const response = await fetchSupportTicket(row.id);
      if (!response.data) {
        toast.error(t('dashboard.supportTickets.notFound'));
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

  const closeChat = () => {
    setChatOpen(false);
    setActiveTicket(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.supportTickets.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('dashboard.supportTickets.hint')}</p>
          </div>
        </div>
        {canCreate.allowed ? (
          <Button type="button" onClick={() => setCreateOpen(true)} className="rounded-xl">
            <Plus className="h-4 w-4" />
            {t('dashboard.supportTickets.newTicket')}
          </Button>
        ) : null}
      </div>

      {!canCreate.allowed && canCreate.reason === 'open_ticket_exists' ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('dashboard.supportTickets.openTicketExists')}
        </div>
      ) : null}

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-gray-500">{t('dashboard.supportTickets.empty')}</p>
        </div>
      ) : (
        <>
          <SupportTicketTable
            tickets={tickets}
            openingTicketId={openingTicketId}
            onOpenTicket={(ticket) => void handleOpenTicket(ticket)}
          />
          <div className="space-y-3 lg:hidden">
            {tickets.map((ticket) => (
              <SupportTicketCard
                key={ticket.id}
                ticket={ticket}
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
          <SupportTicketChatWindow ticket={activeTicket} user={user} embedded />
        ) : null}
      </SupportTicketChatDialog>

      <CreateSupportTicketDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(ticket) => {
          setTickets((prev) => [ticket, ...prev.filter((item) => item.id !== ticket.id)]);
          setActiveTicket(ticket);
          setChatOpen(true);
          refreshList();
        }}
      />
    </div>
  );
}
