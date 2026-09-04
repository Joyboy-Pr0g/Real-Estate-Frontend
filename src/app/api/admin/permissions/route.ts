import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';
import { z } from 'zod';

const permissionBodySchema = z.object({
  name: z.string().trim().min(3).max(120),
  display_name: z.string().trim().min(2).max(200),
  resource: z.string().trim().min(2).max(80),
  action: z.string().trim().min(2).max(40),
  path: z.string().trim().min(6).max(255),
});

export async function GET(request: NextRequest) {
  return proxyToBackend(request, {
    path: backendPaths.auth.permissions,
    method: 'GET',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = permissionBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'Validation failed' },
        { status: 400 },
      );
    }

    return proxyToBackend(
      new NextRequest(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(parsed.data),
      }),
      { path: backendPaths.auth.permissions, method: 'POST' },
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}
