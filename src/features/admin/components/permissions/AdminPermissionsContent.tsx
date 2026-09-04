import { redirect } from 'next/navigation';
import { AdminPermissionsPanel } from '@/features/admin/components/permissions/AdminPermissionsPanel';
import {
  getAllPermissionsServer,
  getPermissionAssignmentsServer,
} from '@/features/admin/services/admin-permissions-server-service';
import { getSession } from '@/lib/auth/session';

interface AdminPermissionsContentProps {
  searchParams: Promise<{
    user_id?: string;
    permission_id?: string;
  }>;
}

export async function AdminPermissionsContent({ searchParams }: AdminPermissionsContentProps) {
  const user = await getSession();
  if (!user || user.role !== 'platform_admin') {
    redirect('/admin');
  }

  const params = await searchParams;
  const [assignments, allPermissions] = await Promise.all([
    getPermissionAssignmentsServer({
      user_id: params.user_id,
      permission_id: params.permission_id,
    }),
    getAllPermissionsServer(),
  ]);

  return (
    <AdminPermissionsPanel
      initialAssignments={assignments}
      allPermissions={allPermissions}
      initialUserId={params.user_id}
      initialPermissionId={params.permission_id}
    />
  );
}
