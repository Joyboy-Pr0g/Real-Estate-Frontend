'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  applyListingsClientNavigation,
  normalizeSearchQueryKey,
  readListingsSearchQueryKey,
  subscribeListingsSearchParams,
} from '@/features/listings/lib/listings-client-navigation';

export function useListingsSearchParams(): URLSearchParams {
  const nextSearchParams = useSearchParams();
  const serverKey = normalizeSearchQueryKey(nextSearchParams);

  const queryKey = useSyncExternalStore(
    subscribeListingsSearchParams,
    readListingsSearchQueryKey,
    () => serverKey,
  );

  return useMemo(() => new URLSearchParams(queryKey), [queryKey]);
}

export function useListingsClientNavigation() {
  return useCallback((href: string, mode: 'push' | 'replace' = 'push') => {
    applyListingsClientNavigation(href, mode);
  }, []);
}
