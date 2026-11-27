import { NextRequest, NextResponse } from 'next/server';
import { revalidateListingsMarketplace } from '@/lib/marketplace/revalidate';
import {
  findPublicListingSlug,
  readListingId,
  readListingSlug,
} from '@/lib/marketplace/listing-revalidation';
import { proxyToBackend } from '@/lib/api/route-handler';
import { withMutationRevalidate } from '@/lib/api/with-mutation-revalidate';

interface ListingMutationProxyOptions {
  path: string;
  method?: string;
  requireAuth?: boolean;
  searchParams?: Record<string, string>;
  listingId?: string;
}

async function readResponseData(response: NextResponse): Promise<unknown> {
  try {
    const body = (await response.clone().json()) as { data?: unknown };
    return body?.data;
  } catch {
    return undefined;
  }
}

export async function proxyListingMutation(
  request: NextRequest,
  options: ListingMutationProxyOptions,
): Promise<NextResponse> {
  const { listingId, ...proxyOptions } = options;
  const previousSlug = listingId ? await findPublicListingSlug(listingId) : undefined;
  const response = await proxyToBackend(request, proxyOptions);
  const data = await readResponseData(response);

  return withMutationRevalidate(response, () =>
    revalidateListingsMarketplace({
      listingId: listingId ?? readListingId(data),
      slugs: [previousSlug, readListingSlug(data)],
    }),
  );
}
