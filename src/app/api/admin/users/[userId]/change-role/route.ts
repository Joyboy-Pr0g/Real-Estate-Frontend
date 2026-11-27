import { NextRequest, NextResponse } from 'next/server';
import { proxyMarketplaceMutation } from '@/lib/api/marketplace-mutation-route';
import { revalidateUsersMarketplace } from '@/lib/marketplace/revalidate';
import { backendPaths } from '@/lib/api/endpoints';
import { sendRoleBodySchema } from '@/features/auth/schemas/auth-schemas';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    const parsed = sendRoleBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'Validation failed' },
        { status: 400 },
      );
    }

    return proxyMarketplaceMutation(
      new NextRequest(request.url, {
        method: 'PATCH',
        headers: request.headers,
        body: JSON.stringify(parsed.data),
      }),
      { path: backendPaths.auth.changeUserRole(userId), method: 'PATCH' },
      revalidateUsersMarketplace,
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}
