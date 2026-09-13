'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { createConversation } from '@/features/messaging/services/messaging-client';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface MessageListingButtonProps {
  listingId: string;
  listingSlug: string;
  isAuthenticated: boolean;
  canStartMessage: boolean;
  className?: string;
}

export function MessageListingButton({
  listingId,
  listingSlug,
  isAuthenticated,
  canStartMessage,
  className,
}: MessageListingButtonProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/listings/${listingSlug}`);
      return;
    }

    if (!canStartMessage) return;

    setLoading(true);
    try {
      const response = await createConversation(listingId);
      if (response.data?.id) {
        router.push(`/dashboard/messages/${response.data.id}`);
      }
    } catch {
      // navigation errors are non-blocking for the listing page
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={loading}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-brand-muted hover:text-brand-dark disabled:opacity-60',
        className,
      )}
      aria-label={t('dashboard.messages')}
      title={t('dashboard.messages')}
    >
      <MessageCircle className="h-4 w-4" />
    </button>
  );
}
