import { NextRequest, NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import { registerBodySchema } from '@/features/auth/schemas/auth-schemas';
import { AuthLoginResponse } from '@/features/auth/types/user';
import { setSessionFromAuthResponse } from '@/lib/auth/auth-bff';
import { ApiError } from '@/lib/errors/api-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'فشل التسجيل' },
        { status: 400 },
      );
    }

    const response = await fetchBackend<AuthLoginResponse>(backendPaths.auth.register, {
      method: 'POST',
      body: parsed.data,
      cacheProfile: 'none',
    });

    const user = await setSessionFromAuthResponse(response.data!);

    return NextResponse.json(
      {
        success: true,
        message: response.message,
        data: { user },
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ success: false, message: err.message }, { status: err.status });
    }
    return NextResponse.json({ success: false, message: 'فشل التسجيل' }, { status: 500 });
  }
}
