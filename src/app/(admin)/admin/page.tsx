import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/features/admin/components/dashboard/AdminDashboard';
import { getAdminDashboard } from '@/features/admin/services/admin-dashboard-service';
import { getSession } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';

export default async function AdminDashboardPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'platform_admin') redirect('/');

  const dashboard = await getAdminDashboard();

  return (
    <Container className="py-8">
      <AdminDashboard initial={dashboard} adminName={user.f_name} />
    </Container>
  );
}
