'use client';

import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminLatestAction } from '@/features/admin/types/action-logs';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { ACTION_LABEL_KEYS, getChangeEntries } from '@/features/admin/components/audit/action-log-utils';

interface AdminAuditTriggerProps {
  action?: AdminLatestAction | null;
  className?: string;
}

function AuditRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
      <dt className="shrink-0 text-sm text-gray-400 sm:w-36">{label}</dt>
      <dd className="text-sm text-primary-dark">{value}</dd>
    </div>
  );
}

export function AdminAuditTrigger({ action, className }: AdminAuditTriggerProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const hasAction = Boolean(action);
  const changeEntries = getChangeEntries(action?.changes_json);

  if (!hasAction) {
    return <span className={cn('text-xs text-gray-300', className)}>—</span>;
  }

  const actionLabel = ACTION_LABEL_KEYS[action!.action]
    ? t(ACTION_LABEL_KEYS[action!.action])
    : action!.action;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn('h-7 gap-1.5 px-2.5 text-xs', className)}
        onClick={() => setOpen(true)}
      >
        <ClipboardList className="h-3.5 w-3.5" />
        {t('admin.audit')}
        {changeEntries.length > 0 ? (
          <span className="rounded-full bg-brand-muted px-1.5 py-0.5 text-[10px] font-semibold text-brand-dark">
            {changeEntries.length}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]"
          >
            <h2 className="text-lg font-bold text-primary-dark">{t('admin.audit')}</h2>
            <dl className="mt-4 space-y-4">
              <AuditRow
                label={t('admin.lastActionBy')}
                value={action!.admin_name || action!.admin_email || t('admin.unknown')}
              />
              <AuditRow label={t('admin.lastAction')} value={actionLabel} />
              <AuditRow label={t('admin.lastActionAt')} value={formatDateTime(action!.created_at)} />
            </dl>

            {changeEntries.length > 0 ? (
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-400">{t('admin.actionChanges')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {changeEntries.map(({ key, value }) => (
                    <span
                      key={key}
                      title={`${key}: ${value}`}
                      className="inline-flex max-w-full items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1 text-xs ring-1 ring-gray-200"
                    >
                      <span className="text-gray-400">{key}</span>
                      <span className="text-gray-300">·</span>
                      <span className="truncate text-primary-dark max-w-[14rem]">{value}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('admin.close')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
