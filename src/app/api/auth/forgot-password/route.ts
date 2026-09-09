import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';
import { forgotPasswordBodySchema } from '@/features/auth/schemas/auth-schemas';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'فشل إرسال رابط إعادة تعيين كلمة المرور' },
        { status: 400 },
      );
    }

    return proxyToBackend(
      new NextRequest(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(parsed.data),
      }),
      { path: backendPaths.auth.forgotPassword, method: 'POST', requireAuth: false },
    );
  } catch {
    return NextResponse.json({ success: false, message: 'فشل إرسال رابط إعادة تعيين كلمة المرور' }, { status: 400 });
  }
}
