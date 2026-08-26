'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Plus, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { toast } from '@/components/ui/toaster';
import { addOfficeUser, removeOfficeUsers } from '@/features/office/services/office-client';
import { OfficeUserMember } from '@/features/office/types/office';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';

interface OfficeUsersPanelProps {
  officeId: string;
  members: OfficeUserMember[];
  currentUserId: string;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

const ROLE_STYLES: Record<string, string> = {
  office_admin: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  office_manager: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  office_agent: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
};

export function OfficeUsersPanel({ officeId, members, currentUserId }: OfficeUsersPanelProps) {
  const { t } = useLocale();
  const router = useRouter();

  const [showAddForm, setShowAddForm] = useState(false);
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'office_agent' | 'office_manager'>('office_agent');
  const [submitting, setSubmitting] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const toggleSelected = (userId: string) => {
    setSelected((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleAddSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await addOfficeUser(officeId, {
        f_name: fName.trim(),
        l_name: lName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        role,
      });
      toast.success(t('dashboard.office.userAdded'));
      setFName('');
      setLName('');
      setEmail('');
      setPhoneNumber('');
      setRole('office_agent');
      setShowAddForm(false);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeOfficeUsers(officeId, selected);
      toast.success(t('dashboard.office.usersRemoved'));
      setSelected([]);
      setConfirmOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" onClick={() => setShowAddForm((v) => !v)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t('dashboard.office.addUser')}
        </Button>

        {selected.length > 0 ? (
          <Button type="button" variant="dangerOutline" onClick={() => setConfirmOpen(true)}>
            {t('dashboard.office.removeSelected')} ({selected.length})
          </Button>
        ) : null}
      </div>

      {showAddForm ? (
        <form
          onSubmit={handleAddSubmit}
          className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:grid-cols-2"
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('auth.firstName')}</span>
            <input required value={fName} onChange={(e) => setFName(e.target.value)} className={fieldClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('auth.lastName')}</span>
            <input required value={lName} onChange={(e) => setLName(e.target.value)} className={fieldClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.emailLabel')}</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('auth.phone')}</span>
            <input
              required
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.office.role')}</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'office_agent' | 'office_manager')}
              className={fieldClass}
            >
              <option value="office_agent">{t('dashboard.office.role.agent')}</option>
              <option value="office_manager">{t('dashboard.office.role.manager')}</option>
            </select>
          </label>

          <div className="flex items-end justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} disabled={submitting}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('dashboard.submitting') : t('dashboard.submit')}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {members.map((member) => {
          const isSelf = member.user_id === currentUserId;
          const isAdmin = member.role === 'office_admin';
          const lockedFromRemoval = isSelf || isAdmin;

          return (
            <div
              key={member.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]"
            >
              {!lockedFromRemoval ? (
                <input
                  type="checkbox"
                  checked={selected.includes(member.user_id)}
                  onChange={() => toggleSelected(member.user_id)}
                  className="h-4 w-4 shrink-0 rounded border-gray-300"
                />
              ) : (
                <span className="w-4 shrink-0" />
              )}

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
                <UserRound className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-primary-dark">
                  {member.user.f_name} {member.user.l_name}
                  {isSelf ? <span className="ms-1.5 text-xs font-normal text-gray-400">({t('dashboard.you')})</span> : null}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {member.user.email} · {member.user.phone_number}
                </p>
              </div>

              <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold', ROLE_STYLES[member.role])}>
                {t(`dashboard.office.role.${member.role.replace('office_', '')}` as TranslationKey)}
              </span>

              <Link
                href={`/dashboard/office/${officeId}/users/${member.user_id}`}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                {t('dashboard.office.viewUserLogs')}
              </Link>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={t('dashboard.office.confirmRemoveTitle')}
        description={t('dashboard.office.confirmRemoveDescription')}
        confirmText={t('dashboard.office.removeSelected')}
        cancelText={t('admin.cancel')}
        danger
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
