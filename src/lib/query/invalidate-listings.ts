import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';

export function invalidateListingsQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
}
