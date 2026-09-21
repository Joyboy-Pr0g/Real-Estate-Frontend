import { NextRequest, NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import { UserPermissionAccess } from '@/features/admin/types/permission';
import {
  getAuthToken,
  getSession,
  setAdminPermissionsCookie,
  clearAdminPermissionsCookie,
} from '@/lib/auth/session';
import { ApiError } from '@/lib/errors/api-error';

export async function GET(_request: NextRequest) {
  try {
    const token = await getAuthToken({ refresh: true });
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = await getSession();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetchBackend<UserPermissionAccess[]>(backendPaths.auth.permissionsMe, {
      token,
      cacheProfile: 'none',
    });

    const permissions = response.data ?? [];

    if (user.role === 'sub_admin') {
      await setAdminPermissionsCookie(permissions);
    } else {
      await clearAdminPermissionsCookie();
    }

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: err.message, error: { message: err.message, details: err.details } },
        { status: err.status },
      );
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
