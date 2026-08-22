import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { getSession } from '@/lib/auth/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'platform_admin') redirect('/');

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      <AdminSidebar user={user} />
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
