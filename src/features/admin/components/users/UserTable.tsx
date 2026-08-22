'use client';

import { AdminUserListItem, UserRole } from '@/features/auth/types/user';
import { UserActionsMenu } from '@/features/admin/components/users/UserActionsMenu';
import { UserRoleBadge, UserStatusBadge } from '@/features/admin/components/users/UserBadges';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';

const roleKeys: Record<UserRole, TranslationKey> = {
  buyer: 'admin.role.buyer',
  office: 'admin.role.office',
  platform_admin: 'admin.role.platform_admin',
};

interface UserTableProps {
  users: AdminUserListItem[];
  actionUserId: string | null;
  onActivate: (userId: string) => void;
  onDeactivate: (userId: string) => void;
  onChangeRole: (user: AdminUserListItem) => void;
  onChangePassword: (userId: string) => void;
  onSoftDelete: (user: AdminUserListItem) => void;
  onRestore: (userId: string) => void;
  onHardDelete: (user: AdminUserListItem) => void;
}

export function UserTable({
  users,
  actionUserId,
  onActivate,
  onDeactivate,
  onChangeRole,
  onChangePassword,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: UserTableProps) {
  const { t } = useLocale();

  const statusLabel = (user: AdminUserListItem) => {
    if (user.deleted_at) return t('admin.status.soft_deleted');
    return t(`admin.status.${user.status}` as TranslationKey);
  };

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)] lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-start">
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userName')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userEmail')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userPhone')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userRole')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userStatus')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userJoined')}</th>
              <th className="px-5 py-4 text-end font-semibold text-gray-600">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <p className="font-semibold text-primary-dark">
                    {user.f_name} {user.l_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user.email_verified_at ? t('admin.verified') : t('admin.unverified')}
                  </p>
                </td>
                <td className="px-5 py-4 text-gray-600">{user.email}</td>
                <td className="px-5 py-4 text-gray-500">{user.phone_number || '—'}</td>
                <td className="px-5 py-4">
                  <UserRoleBadge role={user.role} label={t(roleKeys[user.role])} />
                </td>
                <td className="px-5 py-4">
                  <UserStatusBadge
                    status={user.deleted_at ? 'soft_deleted' : user.status}
                    label={statusLabel(user)}
                  />
                </td>
                <td className="px-5 py-4 text-gray-500">{formatDateTime(user.created_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <UserActionsMenu
                      user={user}
                      disabled={actionUserId === user.id}
                      onActivate={() => onActivate(user.id)}
                      onDeactivate={() => onDeactivate(user.id)}
                      onChangeRole={() => onChangeRole(user)}
                      onChangePassword={() => onChangePassword(user.id)}
                      onSoftDelete={() => onSoftDelete(user)}
                      onRestore={() => onRestore(user.id)}
                      onHardDelete={() => onHardDelete(user)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
