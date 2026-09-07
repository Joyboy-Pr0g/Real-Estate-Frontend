'use client';

import { useCallback, useState } from 'react';
import { Activity, Cpu, Database, HardDrive, RefreshCw, Server, Zap } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import {
  fetchSystemStatus,
  type ServiceHealthStatus,
  type SystemStatusReport,
} from '@/features/admin/services/admin-system-status-client';

const statusStyles: Record<ServiceHealthStatus, string> = {
  healthy: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  degraded: 'bg-amber-50 text-amber-700 ring-amber-200',
  down: 'bg-red-50 text-red-700 ring-red-200',
};

function StatusBadge({ status, label }: { status: ServiceHealthStatus; label: string }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusStyles[status])}>
      {label}
    </span>
  );
}

function MetricCard({
  title,
  icon: Icon,
  status,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: ServiceHealthStatus;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand" />
          <h3 className="font-semibold text-primary-dark">{title}</h3>
        </div>
        {status ? <StatusBadge status={status} label={status} /> : null}
      </div>
      <dl className="space-y-2 text-sm text-gray-600">{children}</dl>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-end font-medium text-primary-dark">{value}</dd>
    </div>
  );
}

export function AdminSystemStatusPanel() {
  const { t } = useLocale();
  const [report, setReport] = useState<SystemStatusReport | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSystemStatus();
      setReport(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.systemStatus.title', icon: Activity },
        ]}
        title={t('admin.systemStatus.title')}
        countLabel={report ? report.overall : '—'}
      />

      <div className="flex justify-end">
        <Button type="button" className="rounded-xl" onClick={refresh} disabled={loading}>
          <RefreshCw className={cn('me-2 h-4 w-4', loading && 'animate-spin')} />
          {loading ? t('admin.systemStatus.refreshing') : t('admin.systemStatus.refresh')}
        </Button>
      </div>

      {!report ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
          {t('admin.systemStatus.empty')}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <span className="text-sm text-gray-500">{t('admin.systemStatus.overall')}</span>
            <StatusBadge status={report.overall} label={report.overall} />
            <span className="text-sm text-gray-400">
              {t('admin.systemStatus.checkedAt')}: {new Date(report.checked_at).toLocaleString('ar-YE')}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <MetricCard title={t('admin.systemStatus.api')} icon={Server} status={report.services.api.status}>
              <MetricRow label={t('admin.systemStatus.uptime')} value={`${report.services.api.uptime_sec}s`} />
              <MetricRow label={t('admin.systemStatus.node')} value={report.services.api.node_version} />
              <MetricRow
                label={t('admin.systemStatus.memory')}
                value={`${report.services.api.memory_mb.heapUsed} / ${report.services.api.memory_mb.heapTotal} MB`}
              />
            </MetricCard>

            <MetricCard
              title={t('admin.systemStatus.postgres')}
              icon={Database}
              status={report.services.postgres.status}
            >
              <MetricRow
                label={t('admin.systemStatus.latency')}
                value={report.services.postgres.latency_ms != null ? `${report.services.postgres.latency_ms} ms` : '—'}
              />
              {report.services.postgres.pool ? (
                <>
                  <MetricRow label={t('admin.systemStatus.poolTotal')} value={report.services.postgres.pool.total} />
                  <MetricRow label={t('admin.systemStatus.poolIdle')} value={report.services.postgres.pool.idle} />
                  <MetricRow label={t('admin.systemStatus.poolWaiting')} value={report.services.postgres.pool.waiting} />
                </>
              ) : null}
              {report.services.postgres.error ? (
                <MetricRow label={t('admin.systemStatus.error')} value={report.services.postgres.error} />
              ) : null}
            </MetricCard>

            <MetricCard title={t('admin.systemStatus.redis')} icon={Zap} status={report.services.redis.status}>
              <MetricRow
                label={t('admin.systemStatus.latency')}
                value={report.services.redis.latency_ms != null ? `${report.services.redis.latency_ms} ms` : '—'}
              />
              <MetricRow
                label={t('admin.systemStatus.redisMemory')}
                value={
                  report.services.redis.memory_used_mb != null
                    ? `${report.services.redis.memory_used_mb} MB`
                    : '—'
                }
              />
              <MetricRow
                label={t('admin.systemStatus.redisClients')}
                value={report.services.redis.connected_clients ?? '—'}
              />
              {report.services.redis.error ? (
                <MetricRow label={t('admin.systemStatus.error')} value={report.services.redis.error} />
              ) : null}
            </MetricCard>

            <MetricCard title={t('admin.systemStatus.host')} icon={Cpu}>
              <MetricRow label={t('admin.systemStatus.hostname')} value={report.host.hostname} />
              <MetricRow label={t('admin.systemStatus.platform')} value={report.host.platform} />
              <MetricRow label={t('admin.systemStatus.freeMemory')} value={`${report.host.free_memory_mb} MB`} />
              <MetricRow label={t('admin.systemStatus.loadAvg')} value={report.host.loadavg.join(', ')} />
            </MetricCard>

            <div className="xl:col-span-2">
              <MetricCard title={t('admin.systemStatus.integrations')} icon={HardDrive}>
                <MetricRow
                  label="Cloudinary"
                  value={report.services.integrations.cloudinary.configured ? t('admin.systemStatus.configured') : t('admin.systemStatus.missing')}
                />
                <MetricRow
                  label="Brevo"
                  value={report.services.integrations.brevo.configured ? t('admin.systemStatus.configured') : t('admin.systemStatus.missing')}
                />
                <MetricRow
                  label="Google Places"
                  value={report.services.integrations.google_places.configured ? t('admin.systemStatus.configured') : t('admin.systemStatus.missing')}
                />
                <MetricRow
                  label="Firebase"
                  value={report.services.integrations.firebase.configured ? t('admin.systemStatus.configured') : t('admin.systemStatus.missing')}
                />
              </MetricCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
