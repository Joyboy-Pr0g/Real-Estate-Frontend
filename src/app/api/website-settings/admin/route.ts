import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';
import { revalidateWebsiteSettingsMarketplace } from '@/lib/marketplace/revalidate';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, {
    path: backendPaths.websiteSettings.admin,
    method: 'GET',
  });
}

export async function PATCH(request: NextRequest) {
  const response = await proxyToBackend(request, {
    path: backendPaths.websiteSettings.admin,
    method: 'PATCH',
  });

  try {
    const body = await response.clone().json();
    if (body?.success) {
      revalidateWebsiteSettingsMarketplace();
    }
  } catch {
    // Response may not be JSON on hard failures.
  }

  return response;
}
