import { UserRole, UserStatus } from '@/features/auth/types/user';
import { cn } from '@/lib/utils/cn';

const roleStyles: Record<UserRole, string> = {
  buyer: 'bg-sky-50 text-sky-700 ring-sky-200',
  office: 'bg-amber-50 text-amber-800 ring-amber-200',
  platform_admin: 'bg-brand-muted text-brand-dark ring-brand/20',
  sub_admin: 'bg-violet-50 text-violet-700 ring-violet-200',
};

export function UserRoleBadge({ role, label }: { role: UserRole; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        roleStyles[role],
      )}
    >
      {label}
    </span>
  );
}

const statusStyles: Record<UserStatus | 'soft_deleted', string> = {
  active: 'bg-brand-muted text-brand-dark',
  inactive: 'bg-gray-100 text-gray-600',
  blocked: 'bg-red-50 text-red-700',
  soft_deleted: 'bg-amber-50 text-amber-800',
};

export function UserStatusBadge({
  status,
  label,
}: {
  status: UserStatus | 'soft_deleted';
  label: string;
}) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', statusStyles[status])}>
      {label}
    </span>
  );
}
