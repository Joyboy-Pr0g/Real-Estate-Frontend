import type { AdminConversationInboxRow, ParticipantSummary } from '@/features/messaging/types/messaging';

export function participantName(participant?: ParticipantSummary | null) {
  if (!participant) return '—';
  return `${participant.f_name} ${participant.l_name}`.trim() || participant.f_name || '—';
}

export function formatAdminSellerLabel(item: AdminConversationInboxRow) {
  if (item.seller_side === 'office') {
    const users =
      item.seller_users && item.seller_users.length > 0
        ? item.seller_users
        : item.seller
          ? [item.seller]
          : item.other_participant
            ? [item.other_participant]
            : [];

    const userNames = users.map(participantName).filter((name) => name !== '—');
    const officeName = item.office ? participantName(item.office) : '';

    if (userNames.length > 0 && officeName) {
      return `${userNames.join(' / ')} (${officeName})`;
    }
    if (userNames.length > 0) return userNames.join(' / ');
    if (officeName) return officeName;
    return '—';
  }

  return participantName(item.seller ?? item.other_participant);
}

export function formatAdminConversationParticipants(item: AdminConversationInboxRow) {
  return `${participantName(item.buyer)} ↔ ${formatAdminSellerLabel(item)}`;
}

export function normalizeAdminConversation(
  conversation: AdminConversationInboxRow,
): AdminConversationInboxRow {
  const seller =
    conversation.seller ??
    conversation.seller_users?.[0] ??
    conversation.other_participant ??
    conversation.office ?? {
      id: 'unknown',
      f_name: '—',
      l_name: '',
      user_image_url: null,
    };

  return {
    ...conversation,
    buyer:
      conversation.buyer ??
      ({
        id: 'unknown',
        f_name: '—',
        l_name: '',
        user_image_url: null,
      } satisfies ParticipantSummary),
    seller,
    seller_users:
      conversation.seller_users ??
      (conversation.seller ? [conversation.seller] : conversation.other_participant ? [conversation.other_participant] : undefined),
  };
}
