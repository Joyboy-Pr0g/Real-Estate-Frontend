'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { MessageAdminItem, MessageItem, ParticipantSummary } from '@/features/messaging/types/messaging';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatMessageTime } from '@/lib/utils/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageBubbleProps {
  message: MessageItem | MessageAdminItem;
  isMine: boolean;
  onDelete?: () => void;
  adminMode?: boolean;
  senderLabel?: string;
  alignRightParticipantId?: string;
}

function mediaLoadedKey(messageId: string) {
  return `re-msg-media-${messageId}`;
}

function useMediaUnlocked(messageId: string, unlockedByDefault: boolean) {
  const [unlocked, setUnlocked] = useState(() => {
    if (unlockedByDefault) return true;
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(mediaLoadedKey(messageId)) === '1';
  });

  const unlock = () => {
    setUnlocked(true);
    sessionStorage.setItem(mediaLoadedKey(messageId), '1');
  };

  return { unlocked, unlock };
}

function participantName(participant?: ParticipantSummary) {
  if (!participant) return '';
  return `${participant.f_name} ${participant.l_name}`.trim() || participant.f_name;
}

function MessageImage({ url }: { url: string }) {
  return (
    <Image
      src={url}
      alt=""
      width={240}
      height={180}
      loading="lazy"
      className="h-auto max-h-48 w-auto max-w-full rounded-lg object-cover"
    />
  );
}

function ReceivedImage({
  url,
  messageId,
  adminMode,
}: {
  url: string;
  messageId: string;
  adminMode?: boolean;
}) {
  const { t } = useLocale();
  const { unlocked, unlock } = useMediaUnlocked(messageId, adminMode ?? false);

  if (!unlocked) {
    return (
      <button
        type="button"
        onClick={unlock}
        className="relative block h-40 w-60 overflow-hidden rounded-lg"
        aria-label={t('dashboard.messages.tapToLoad')}
      >
        <span className="absolute inset-0 bg-gradient-to-br from-gray-400/80 to-gray-700/90 blur-md" />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
          <Download className="h-6 w-6" />
          <span className="px-2 text-center text-[11px] font-medium">{t('dashboard.messages.tapToLoad')}</span>
        </span>
      </button>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer">
      <MessageImage url={url} />
    </a>
  );
}

function ReceivedVoice({
  url,
  messageId,
  adminMode,
}: {
  url: string;
  messageId: string;
  adminMode?: boolean;
}) {
  const { t } = useLocale();
  const { unlocked, unlock } = useMediaUnlocked(messageId, adminMode ?? false);

  if (!unlocked) {
    return (
      <button
        type="button"
        onClick={unlock}
        className="flex min-w-[12rem] items-center gap-2 rounded-lg bg-black/10 px-3 py-2 text-sm"
        aria-label={t('dashboard.messages.tapToPlay')}
      >
        <Play className="h-4 w-4" />
        {t('dashboard.messages.tapToPlay')}
      </button>
    );
  }

  return <audio controls src={url} className="max-w-full" />;
}

export function MessageBubble({
  message,
  isMine,
  onDelete,
  adminMode,
  senderLabel,
  alignRightParticipantId,
}: MessageBubbleProps) {
  const { t, locale } = useLocale();
  const timeLabel = formatMessageTime(message.created_at, locale);
  const adminMessage = adminMode ? (message as MessageAdminItem) : null;
  const resolvedSenderLabel =
    senderLabel ?? (adminMessage?.sender ? participantName(adminMessage.sender) : undefined);

  const isRightSide = adminMode
    ? Boolean(alignRightParticipantId && message.sender_id === alignRightParticipantId)
    : isMine;

  if (message.deleted && !adminMode) {
    return (
      <div className={cn('flex', isRightSide ? 'justify-start' : 'justify-end')}>
        <div className="rounded-2xl bg-gray-100 px-4 py-2 text-sm italic text-gray-500">
          {message.placeholder ?? t('dashboard.messages.deleted')}
        </div>
      </div>
    );
  }

  const displayContent = message.deleted && adminMode ? adminMessage?.original_content : message.content;
  const displayMedia = message.deleted && adminMode ? adminMessage?.original_media : message.media;

  const bubbleClassName = cn(
    'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
    isRightSide ? 'bg-brand text-white' : 'bg-gray-100 text-primary-dark',
    onDelete && 'cursor-pointer text-start',
    message.deleted && adminMode && 'border border-dashed border-gray-300',
  );

  const content = (
    <>
      {message.deleted && adminMode ? (
        <p className="mb-1 text-[11px] font-medium text-gray-500">{t('admin.messaging.deletedMessage')}</p>
      ) : null}
      {message.message_type === 'text' ? (
        <p className="whitespace-pre-wrap break-words">{displayContent}</p>
      ) : null}
      {message.message_type === 'image' && displayMedia?.url ? (
        isRightSide || adminMode ? (
          <a href={displayMedia.url} target="_blank" rel="noreferrer">
            <MessageImage url={displayMedia.url} />
          </a>
        ) : (
          <ReceivedImage url={displayMedia.url} messageId={message.id} adminMode={adminMode} />
        )
      ) : null}
      {message.message_type === 'voice' && displayMedia?.url ? (
        isRightSide || adminMode ? (
          <audio controls src={displayMedia.url} className="max-w-full" />
        ) : (
          <ReceivedVoice url={displayMedia.url} messageId={message.id} adminMode={adminMode} />
        )
      ) : null}
      {resolvedSenderLabel ? (
        <p className={cn('mt-1 text-[10px] font-medium', isRightSide ? 'text-white/80' : 'text-gray-500')}>
          {resolvedSenderLabel}
        </p>
      ) : null}
      <p
        className={cn(
          'mt-1 text-[10px]',
          isRightSide ? 'text-white/80' : 'text-gray-500',
        )}
      >
        {timeLabel}
      </p>
    </>
  );

  const alignment = isRightSide ? 'justify-start' : 'justify-end';

  return (
    <div className={cn('flex', alignment)}>
      {onDelete ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={bubbleClassName}>
              {content}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRightSide ? 'start' : 'end'} className="w-36">
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-700"
              onSelect={() => onDelete()}
            >
              {t('dashboard.messages.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className={bubbleClassName}>{content}</div>
      )}
    </div>
  );
}
