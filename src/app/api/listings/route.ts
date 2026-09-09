import { NextRequest } from 'next/server';
import { proxyListingMutation } from '@/lib/api/listing-mutation-route';
import { backendPaths } from '@/lib/api/endpoints';

export async function POST(request: NextRequest) {
  return proxyListingMutation(request, { path: backendPaths.listings.create, method: 'POST' });
}
