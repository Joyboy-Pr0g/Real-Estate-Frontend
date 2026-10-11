import { NextRequest, NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import { requestVerificationBodySchema } from '@/features/auth/schemas/auth-schemas';
import { PhoneVerificationResult } from '@/features/auth/types/user';
import { ApiError } from '@/lib/errors/api-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestVerificationBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'فشل بدء التحقق' },
        { status: 400 },
      );
    }

    const response = await fetchBackend<PhoneVerificationResult | Record<string, never>>(
      backendPaths.auth.requestVerification,
      {
        method: 'POST',
        body: parsed.data,
        cacheProfile: 'none',
      },
    );

    return NextResponse.json({
      success: true,
      message: response.message,
      data: response.data ?? {},
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: err.message,
          error: { message: err.message, details: err.details },
        },
        { status: err.status },
      );
    }
    return NextResponse.json({ success: false, message: 'فشل بدء التحقق' }, { status: 500 });
  }
}
