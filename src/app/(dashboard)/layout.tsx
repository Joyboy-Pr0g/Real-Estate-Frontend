import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { getSession } from '@/lib/auth/session';
import { isAdminPanelRole } from '@/lib/auth/constants';
import { getMyIndividualListerProfile } from '@/features/individual-lister/services/individual-lister-service';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login');
  if (isAdminPanelRole(user.role)) redirect('/admin');

  const individualListerProfile = user.role === 'office' ? null : await getMyIndividualListerProfile();
  const hasIndividualListerProfile = individualListerProfile !== null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      <DashboardSidebar user={user} hasIndividualListerProfile={hasIndividualListerProfile} />
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
