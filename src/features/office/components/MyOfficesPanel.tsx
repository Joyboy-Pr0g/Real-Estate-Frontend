'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Eye, Mail, MapPin, MoreHorizontal, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toaster';
import { OfficeApplicationForm } from '@/features/office/components/OfficeApplicationForm';
import { softDeleteOffice } from '@/features/office/services/office-client';
import { MyOffice } from '@/features/office/types/office';
import { PublicCity } from '@/features/catalog/types/catalog';
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

interface MyOfficesPanelProps {
  offices: MyOffice[];
  userId: string;
  cities: PublicCity[];
}

function isOfficeAdmin(office: MyOffice, userId: string): boolean {
  return office.office_users.some((member) => member.user_id === userId && member.role === 'office_admin');
}

interface OfficeCardProps {
  office: MyOffice;
  isAdmin: boolean;
  onDelete: () => void;
}

function OfficeCard({ office, isAdmin, onDelete }: OfficeCardProps) {
  const { t } = useLocale();
  const detailHref = `/dashboard/office/${office.id}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)]">
      <div className="relative aspect-[16/10] w-full bg-gray-100">
        {office.office_photo_url ? (
          <Image
            src={office.office_photo_url}
            alt={office.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <Building2 className="h-10 w-10" />
          </div>
        )}

        <div className="absolute top-3 end-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200/80 bg-white/95 text-gray-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-primary-dark">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href={detailHref}>
                  <Eye className="h-4 w-4" />
                  {t('admin.viewDetails')}
                </Link>
              </DropdownMenuItem>
              {isAdmin ? (
                <>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href={detailHref}>
                      <Pencil className="h-4 w-4" />
                      {t('admin.edit')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-700"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('admin.softDelete')}
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 truncate text-base font-bold text-primary-dark">{office.name}</h3>
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
              STATUS_STYLES[office.verification_status],
            )}
          >
            {t(`dashboard.verification.${office.verification_status}` as TranslationKey)}
          </span>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="h-4 w-4 shrink-0 text-gray-400" />
            <dd className="truncate text-gray-600">{office.email}</dd>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Phone className="h-4 w-4 shrink-0 text-gray-400" />
            <dd className="truncate text-gray-600" dir="ltr">
              {office.phone_number}
            </dd>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
            <dd className="truncate text-gray-600">
              {office.city.name}, {office.neighborhood.name}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export function MyOfficesPanel({ offices, userId, cities }: MyOfficesPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MyOffice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canCreateOffice =
    offices.length === 0 || offices.some((office) => isOfficeAdmin(office, userId));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await softDeleteOffice(deleteTarget.id);
      toast.success(t('dashboard.office.softDeleted'));
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {canCreateOffice && !showCreateForm ? (
        <div className="flex justify-end">
          <Button type="button" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" />
            {t('dashboard.office.createNew')}
          </Button>
        </div>
      ) : null}

      {showCreateForm ? (
        <section className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-base font-bold text-primary-dark">{t('dashboard.office.createNew')}</h2>
          <OfficeApplicationForm
            cities={cities}
            onCancel={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              router.refresh();
            }}
          />
        </section>
      ) : null}

      {offices.length === 0 && !showCreateForm ? (
        <p className="text-gray-500">{t('dashboard.office.noOffice')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((office) => (
            <OfficeCard
              key={office.id}
              office={office}
              isAdmin={isOfficeAdmin(office, userId)}
              onDelete={() => setDeleteTarget(office)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={t('dashboard.office.confirmDeleteTitle')}
        description={t('dashboard.office.confirmDeleteDescription')}
        confirmText={t('admin.softDelete')}
        cancelText={t('admin.cancel')}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
