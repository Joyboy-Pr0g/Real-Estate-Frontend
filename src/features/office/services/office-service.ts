import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import { MyOffice, OfficeDetail, OfficeListingAnalytics, OfficeUserAnalytics, OfficeAnalyticsPeriod } from '@/features/office/types/office';

export async function getMyOffices(): Promise<MyOffice[]> {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const response = await serverFetch<MyOffice[]>(backendPaths.offices.my, {
      token,
      cacheProfile: 'none',
    });
    return response.data ?? [];
  } catch {
    return [];
  }
}

export async function getOfficeDetail(id: string): Promise<OfficeDetail | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await serverFetch<OfficeDetail>(backendPaths.offices.byId(id), {
      token,
      cacheProfile: 'none',
    });
    return response.data ?? null;
  } catch {
    return null;
  }
}

export async function getMyOfficeDetail(): Promise<OfficeDetail | null> {
  const offices = await getMyOffices();
  const office = offices[0];
  if (!office) return null;
  return getOfficeDetail(office.id);
}

export async function getOfficeAnalytics(
  officeId: string,
  period: OfficeAnalyticsPeriod = 'last_year',
  cityId?: string,
): Promise<OfficeListingAnalytics | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const searchParams: Record<string, string> = { period };
    if (cityId) searchParams.city_id = cityId;

    const response = await serverFetch<OfficeListingAnalytics>(backendPaths.listings.officeAnalytics(officeId), {
      token,
      cacheProfile: 'none',
      searchParams,
    });
    return response.data ?? null;
  } catch {
    return null;
  }
}

export async function getOfficeUserAnalytics(
  officeId: string,
  period: OfficeAnalyticsPeriod = 'last_year',
): Promise<OfficeUserAnalytics | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await serverFetch<OfficeUserAnalytics>(backendPaths.listings.officeUserAnalytics(officeId), {
      token,
      cacheProfile: 'none',
      searchParams: { period },
    });
    return response.data ?? null;
  } catch {
    return null;
  }
}
