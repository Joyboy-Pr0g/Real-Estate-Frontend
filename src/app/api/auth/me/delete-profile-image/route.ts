import { NextRequest, NextResponse } from 'next/server';
import { backendPaths } from '@/lib/api/endpoints';
import { proxyToBackend } from '@/lib/api/route-handler';

export async function PATCH(request: NextRequest) {
    try {
      return proxyToBackend(request, { path: backendPaths.auth.meDeleteProfileImage, method: 'PATCH' });
    } catch {
      return NextResponse.json({ success: false, message: 'فشل حذف صورة الملف الشخصي' }, { status: 400 });
    }
  }