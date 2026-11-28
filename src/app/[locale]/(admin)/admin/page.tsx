import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/features/admin/components/dashboard/AdminDashboard';
import { getAdminDashboard } from '@/features/admin/services/admin-dashboard-service';
import {
  getSubAdminFallbackPath,
  hasPermissionName,
} from '@/lib/auth/admin-route-permissions';
import { getSession, getSubAdminPermissions } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';

export default async function AdminDashboardPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'platform_admin' && user.role !== 'sub_admin') redirect('/');

  const permissions = await getSubAdminPermissions();

  if (user.role === 'sub_admin' && !hasPermissionName(permissions, 'dashboard.view')) {
    redirect(getSubAdminFallbackPath(permissions));
  }

  const dashboard = await getAdminDashboard();

  if (user.role === 'sub_admin' && !dashboard) {
    redirect(`${getSubAdminFallbackPath(permissions)}?access_denied=1`);
  }

  return (
    <Container className="py-8">
      <AdminDashboard initial={dashboard} adminName={user.f_name} />
    </Container>
  );
}
