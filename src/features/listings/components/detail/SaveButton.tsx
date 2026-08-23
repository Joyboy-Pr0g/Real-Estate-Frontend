'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { bffPaths } from '@/lib/api/endpoints';
import { clientFetch } from '@/lib/api/client';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface SaveButtonProps {
  listingId: string;
  isAuthenticated: boolean;
  initialSaved?: boolean;
}

export function SaveButton({ listingId, isAuthenticated, initialSaved = false }: SaveButtonProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  const toggleSave = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/listings/${listingId}`);
      return;
    }
    if (pending) return;

    setPending(true);
    const nextSaved = !saved;
    try {
      await clientFetch(bffPaths.listings.save(listingId), {
        method: nextSaved ? 'POST' : 'DELETE',
      });
      setSaved(nextSaved);
    } catch {
      // no-op: leave saved state unchanged on failure
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={() => void toggleSave()}
      whileTap={{ scale: 0.95 }}
      disabled={pending}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        saved
          ? 'border-secondary/30 bg-secondary/10 text-secondary'
          : 'border-gray-200 bg-white text-primary-dark hover:bg-gray-50',
      )}
    >
      <Heart className={cn('h-4 w-4', saved && 'fill-secondary text-secondary')} />
      {saved ? t('detail.actions.saved') : t('detail.actions.save')}
    </motion.button>
  );
}
