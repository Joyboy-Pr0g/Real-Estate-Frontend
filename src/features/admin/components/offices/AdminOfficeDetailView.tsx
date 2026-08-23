'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Building2, FileText, Loader2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { toast } from '@/components/ui/toaster';
import { RejectReasonModal } from '@/features/admin/components/RejectReasonModal';
import {
  verifyOffice,
  rejectOffice,
  suspendOffice,
  unsuspendOffice,
  adminSoftDeleteOffice,
  restoreOffice,
  hardDeleteOffice,
  forceRemoveOfficeUsers,
} from '@/features/office/services/admin-offices-client';
import { OfficeDetail } from '@/features/office/types/office';
import { formatDateTime } from '@/lib/utils/format';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  verified: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  suspended: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

interface AdminOfficeDetailViewProps {
  office: OfficeDetail;
}

export function AdminOfficeDetailView({ office }: AdminOfficeDetailViewProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'soft_delete' | 'hard_delete' | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  const deletedAt = office.deleted_at;
  const style = deletedAt ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : STATUS_STYLES[office.verification_status];
  const label = deletedAt
    ? t('admin.status.soft_deleted')
    : t(`dashboard.verification.${office.verification_status}` as TranslationKey);

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    setSubmitting(true);
    try {
      await action();
      toast.success(successMessage);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
      setConfirmAction(null);
    }
  };

  const handleReject = (reason: string) => {
    void runAction(() => rejectOffice(office.id, reason), t('admin.officeRejected')).then(() => setRejectOpen(false));
  };

  const handleRemoveUser = async (userId: string) => {
    setRemovingUserId(userId);
    try {
      await forceRemoveOfficeUsers(office.id, [userId]);
      toast.success(t('admin.officeUserRemoved'));
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemovingUserId(null);
    }
  };

  const documentEntries = office.documents
    ? ([
        ['id', office.documents.id.url],
        ['officeLicense', office.documents.office_license.url],
        ['commercialLicense', office.documents.commercial_license.url],
      ] as const)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {office.office_photo?.url ? (
              <Image src={office.office_photo.url} alt={office.name} fill className="object-cover" sizes="64px" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <Building2 className="h-6 w-6" />
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-primary-dark">{office.name}</h1>
              <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', style)}>{label}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {office.city.name}, {office.neighborhood.name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!deletedAt ? (
            <>
              {(office.verification_status === 'pending' || office.verification_status === 'rejected') ? (
                <Button
                  type="button"
                  disabled={submitting}
                  onClick={() => void runAction(() => verifyOffice(office.id), t('admin.officeVerified'))}
                >
                  {t('admin.verify')}
                </Button>
              ) : null}

              {office.verification_status === 'pending' ? (
                <Button type="button" variant="dangerOutline" disabled={submitting} onClick={() => setRejectOpen(true)}>
                  {t('admin.reject')}
                </Button>
              ) : null}

              {office.verification_status === 'verified' ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => void runAction(() => suspendOffice(office.id), t('admin.officeSuspended'))}
                >
                  {t('admin.suspend')}
                </Button>
              ) : null}

              {office.verification_status === 'suspended' ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => void runAction(() => unsuspendOffice(office.id), t('admin.officeUnsuspended'))}
                >
                  {t('admin.unsuspend')}
                </Button>
              ) : null}

              <Button type="button" variant="dangerOutline" disabled={submitting} onClick={() => setConfirmAction('soft_delete')}>
                {t('admin.softDelete')}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => void runAction(() => restoreOffice(office.id), t('admin.officeRestored'))}
              >
                {t('admin.restore')}
              </Button>
              <Button type="button" variant="danger" disabled={submitting} onClick={() => setConfirmAction('hard_delete')}>
                {t('admin.hardDelete')}
              </Button>
            </>
          )}
        </div>
      </div>

      {office.verification_status === 'rejected' && office.rejected_reason ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {t('dashboard.rejectedReason')}: {office.rejected_reason}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-bold text-primary-dark">{t('dashboard.office.documents')}</h2>
            {documentEntries.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">{t('admin.noDocuments')}</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {documentEntries.map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                  >
                    <Image
                      src={url}
                      alt={t(`dashboard.office.doc.${key}` as TranslationKey)}
                      fill
                      className="object-cover"
                      sizes="200px"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-black/60 px-2 py-1 text-xs font-medium text-white">
                      <FileText className="h-3 w-3 shrink-0" />
                      {t(`dashboard.office.doc.${key}` as TranslationKey)}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-bold text-primary-dark">
              {t('admin.officeTeam')} ({office.office_users.length})
            </h2>
            <div className="mt-4 space-y-2">
              {office.office_users.map((member) => (
                <div key={member.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-primary-dark">
                      {member.user.f_name} {member.user.l_name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {member.user.email} · {member.user.phone_number}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                      member.role === 'office_admin' ? 'bg-brand-muted text-brand-dark' : 'bg-gray-100 text-gray-600',
                    )}
                  >
                    {t(`dashboard.office.role.${member.role.replace('office_', '')}` as TranslationKey)}
                  </span>
                  {member.role !== 'office_admin' ? (
                    <Button
                      type="button"
                      variant="dangerOutline"
                      size="sm"
                      disabled={removingUserId === member.user_id}
                      onClick={() => void handleRemoveUser(member.user_id)}
                    >
                      {removingUserId === member.user_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t('admin.remove')}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">{t('auth.phone')}</dt>
                <dd className="font-medium text-primary-dark">{office.phone_number}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">{t('dashboard.emailLabel')}</dt>
                <dd className="font-medium text-primary-dark">{office.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">{t('dashboard.address')}</dt>
                <dd className="text-end font-medium text-primary-dark">{office.address}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">{t('admin.userJoined')}</dt>
                <dd className="font-medium text-primary-dark">{formatDateTime(office.created_at)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={confirmAction !== null}
        title={t('admin.confirmTitle').replace('{name}', office.name)}
        description={
          confirmAction === 'hard_delete'
            ? t('admin.confirmHardDelete').replace('{name}', office.name)
            : t('admin.confirmSoftDelete').replace('{name}', office.name)
        }
        confirmText={confirmAction === 'hard_delete' ? t('admin.hardDelete') : t('admin.softDelete')}
        cancelText={t('admin.cancel')}
        loading={submitting}
        danger
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction === 'hard_delete') {
            void runAction(() => hardDeleteOffice(office.id), t('admin.officeDeleted'));
          } else {
            void runAction(() => adminSoftDeleteOffice(office.id), t('admin.officeSoftDeleted'));
          }
        }}
      />

      <RejectReasonModal
        open={rejectOpen}
        title={t('admin.confirmTitle').replace('{name}', office.name)}
        loading={submitting}
        onConfirm={handleReject}
        onCancel={() => setRejectOpen(false)}
      />
    </div>
  );
}
