import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { AdminAccessToast } from '@/features/admin/components/AdminAccessToast';
import { AdminPermissionsCookieSync } from '@/features/admin/components/AdminPermissionsCookieSync';
import { PermissionsProvider } from '@/features/admin/providers/permissions-provider';
import { NotificationProviders } from '@/features/notifications/components/NotificationProviders';
import { getSession, getSubAdminPermissions } from '@/lib/auth/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'platform_admin' && user.role !== 'sub_admin') redirect('/');

  const permissions = await getSubAdminPermissions(user);

  return (
    <PermissionsProvider user={user} permissions={permissions}>
      <NotificationProviders user={user} />
      {user.role === 'sub_admin' ? <AdminPermissionsCookieSync /> : null}
      <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
        <AdminSidebar user={user} />
        <main className="min-w-0 flex-1 overflow-auto">
          <Suspense fallback={null}>
            <AdminAccessToast />
          </Suspense>
          {children}
        </main>
      </div>
    </PermissionsProvider>
  );
}
