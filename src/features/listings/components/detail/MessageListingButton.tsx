'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { createConversation } from '@/features/messaging/services/messaging-client';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface MessageListingButtonProps {
  listingId: string;
  listingSlug: string;
  isAuthenticated: boolean;
  canStartMessage: boolean;
  className?: string;
  variant?: 'icon' | 'bar';
}

export function MessageListingButton({
  listingId,
  listingSlug,
  isAuthenticated,
  canStartMessage,
  className,
  variant = 'icon',
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

  if (variant === 'bar') {
    return (
      <Button
        onClick={() => void handleClick()}
        disabled={loading}
        size="lg"
        className="w-full"
        aria-label={t('dashboard.messages')}
        title={t('dashboard.messages')}
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        {isAuthenticated ? t('detail.office.sendMessage') : t('nav.login')}
      </Button>
    );
  }

  return (
    <Button
      onClick={() => void handleClick()}
      disabled={loading}
      size="icon"
      className="w-10 h-10"
      aria-label={t('dashboard.messages')}
      title={t('dashboard.messages')}
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  );
}
