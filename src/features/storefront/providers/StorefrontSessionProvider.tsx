'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bffPaths } from '@/lib/api/endpoints';
import { parseApiResponse } from '@/lib/api/parse-response';
import { queryKeys } from '@/lib/query/keys';
import type { AuthUser } from '@/features/auth/types/user';

export type StorefrontSessionStatus = 'loading' | 'authenticated' | 'anonymous';

interface StorefrontSessionValue {
  user: AuthUser | null;
  status: StorefrontSessionStatus;
  isAuthenticated: boolean;
  clear: () => void;
}

const StorefrontSessionContext = createContext<StorefrontSessionValue | null>(null);

async function fetchStorefrontSession(): Promise<AuthUser | null> {
  const response = await fetch(bffPaths.auth.me, {
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  const json = await parseApiResponse<AuthUser>(response);
  return json.data ?? null;
}

export function StorefrontSessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.storefrontSession,
    queryFn: fetchStorefrontSession,
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(
    () => () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.storefrontSession });
    },
    [queryClient],
  );

  const user = sessionQuery.data ?? null;
  const isPending = sessionQuery.isPending;

  const value = useMemo<StorefrontSessionValue>(
    () => ({
      user,
      status: isPending ? 'loading' : user ? 'authenticated' : 'anonymous',
      isAuthenticated: Boolean(user),
      clear: () => queryClient.setQueryData(queryKeys.auth.storefrontSession, null),
    }),
    [user, isPending, queryClient],
  );

  return <StorefrontSessionContext.Provider value={value}>{children}</StorefrontSessionContext.Provider>;
}

export function useStorefrontSession(): StorefrontSessionValue {
  const ctx = useContext(StorefrontSessionContext);
  if (!ctx) throw new Error('useStorefrontSession must be used within StorefrontSessionProvider');
  return ctx;
}
