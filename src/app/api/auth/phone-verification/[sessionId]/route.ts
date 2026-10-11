import { NextRequest, NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import { PhoneVerificationStatusResponse } from '@/features/auth/types/user';
import { ApiError } from '@/lib/errors/api-error';

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    if (!sessionId?.trim()) {
      return NextResponse.json({ success: false, message: 'معرف الجلسة مطلوب' }, { status: 400 });
    }

    const response = await fetchBackend<PhoneVerificationStatusResponse>(
      backendPaths.auth.phoneVerification(sessionId),
      { cacheProfile: 'none' },
    );

    return NextResponse.json({
      success: true,
      message: response.message,
      data: response.data,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ success: false, message: err.message }, { status: err.status });
    }
    return NextResponse.json({ success: false, message: 'فشل جلب حالة التحقق' }, { status: 500 });
  }
}
