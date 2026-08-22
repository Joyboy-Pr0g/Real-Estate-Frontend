'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminUserListItem, UserRole } from '@/features/auth/types/user';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';

const ASSIGNABLE_ROLES: UserRole[] = ['buyer', 'office'];

interface ChangeRoleModalProps {
  open: boolean;
  user: AdminUserListItem | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (role: UserRole) => void;
}

export function ChangeRoleModal({
  open,
  user,
  loading = false,
  onCancel,
  onConfirm,
}: ChangeRoleModalProps) {
  const { t } = useLocale();
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');

  const availableRoles = useMemo(() => {
    if (!user) return [];
    return ASSIGNABLE_ROLES.filter((role) => role !== user.role);
  }, [user]);

  useEffect(() => {
    if (!open || !user) {
      setSelectedRole('');
      return;
    }
    setSelectedRole(availableRoles[0] ?? '');
  }, [open, user, availableRoles]);

  if (!open || !user) return null;

  const fullName = `${user.f_name} ${user.l_name}`.trim();
  const currentRoleLabel = t(`admin.role.${user.role}` as TranslationKey);
  const canConfirm = Boolean(selectedRole) && selectedRole !== user.role;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]"
      >
        <h2 className="text-lg font-bold text-primary-dark">{t('admin.changeRoleTitle')}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {t('admin.changeRoleDescription').replace('{name}', fullName)}
        </p>

        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-500">
            {t('admin.currentRole')}: <span className="font-medium text-primary-dark">{currentRoleLabel}</span>
          </p>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.selectNewRole')}</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              disabled={loading || availableRoles.length === 0}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand/40"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {t(`admin.role.${role}` as TranslationKey)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {t('admin.cancel')}
          </Button>
          <Button
            type="button"
            disabled={loading || !canConfirm}
            onClick={() => {
              if (!selectedRole || selectedRole === user.role) return;
              onConfirm(selectedRole);
            }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('admin.confirmChangeRole')}
          </Button>
        </div>
      </div>
    </div>
  );
}
