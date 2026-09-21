import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';
import { submitContactBodySchema } from '@/features/contact/schemas/contact-schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submitContactBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'فشل إرسال الرسالة' },
        { status: 400 },
      );
    }

    return proxyToBackend(
      new NextRequest(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(parsed.data),
      }),
      { path: backendPaths.contacts.submit, method: 'POST', requireAuth: false },
    );
  } catch {
    return NextResponse.json({ success: false, message: 'فشل إرسال الرسالة' }, { status: 400 });
  }
}
