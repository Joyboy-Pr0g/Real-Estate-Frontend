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
  sub_admin: 'admin.role.sub_admin',
};

interface UserCardProps {
  user: AdminUserListItem;
  actionUserId: string | null;
  onActivate: (userId: string) => void;
  onDeactivate: (userId: string) => void;
  onChangeRole: (user: AdminUserListItem) => void;
  onChangePassword: (userId: string) => void;
  onSoftDelete: (user: AdminUserListItem) => void;
  onRestore: (userId: string) => void;
  onHardDelete: (user: AdminUserListItem) => void;
}

export function UserCard({
  user,
  actionUserId,
  onActivate,
  onDeactivate,
  onChangeRole,
  onChangePassword,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: UserCardProps) {
  const { t } = useLocale();

  const statusLabel = user.deleted_at
    ? t('admin.status.soft_deleted')
    : t(`admin.status.${user.status}` as TranslationKey);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-var(--shadow-soft)">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-primary-dark">
            {user.f_name} {user.l_name}
          </h3>
          <p className="truncate text-sm text-gray-500">{user.email}</p>
        </div>
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

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <UserRoleBadge role={user.role} label={t(roleKeys[user.role])} />
        <UserStatusBadge
          status={user.deleted_at ? 'soft_deleted' : user.status}
          label={statusLabel}
        />
      </div>

      <div className="mt-3 grid gap-1 text-sm text-gray-500">
        <p>{user.phone_number || '—'}</p>
        <p>{formatDateTime(user.created_at)}</p>
      </div>
    </article>
  );
}
