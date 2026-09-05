'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Megaphone, Send } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { Button, ButtonLink } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  AnnouncementHtmlPreview,
  AnnouncementRichEditor,
} from '@/features/admin/components/announcements/AnnouncementRichEditor';
import {
  estimateAnnouncementAudience,
  saveAnnouncementDraft,
  sendAnnouncementNow,
} from '@/features/admin/services/admin-announcements-client';
import type { AnnouncementAudience } from '@/features/admin/types/admin-announcement';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getErrorMessage } from '@/lib/errors/api-error';
import { toast } from '@/components/ui/toaster';

const AUDIENCES: AnnouncementAudience[] = ['all_active', 'buyers', 'offices'];

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function AdminSendAnnouncementPanel() {
  const router = useRouter();
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const canSend = hasPermission('announcements.send');

  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('<p></p>');
  const [audience, setAudience] = useState<AnnouncementAudience>('all_active');
  const [scheduledAt, setScheduledAt] = useState('');
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    startTransition(async () => {
      try {
        const count = await estimateAnnouncementAudience(audience);
        if (!cancelled) setAudienceCount(count);
      } catch {
        if (!cancelled) setAudienceCount(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [audience]);

  const sanitizedPreview = DOMPurify.sanitize(bodyHtml);
  const pushPreview = stripHtml(sanitizedPreview).slice(0, 160);

  const buildPayload = useCallback(
    () => ({
      title: title.trim(),
      body_html: bodyHtml,
      audience,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    }),
    [audience, bodyHtml, scheduledAt, title],
  );

  const validate = (): boolean => {
    if (title.trim().length < 2) {
      toast.error(t('admin.announcements.titleRequired'));
      return false;
    }
    if (!stripHtml(bodyHtml)) {
      toast.error(t('admin.announcements.bodyRequired'));
      return false;
    }
    if (scheduledAt && new Date(scheduledAt).getTime() <= Date.now()) {
      toast.error(t('admin.announcements.scheduleFuture'));
      return false;
    }
    return true;
  };

  const handleSaveDraft = () => {
    if (!canSend || !validate()) return;
    startTransition(async () => {
      try {
        const result = await saveAnnouncementDraft(buildPayload());
        toast.success(t('admin.announcements.draftSaved'));
        router.push(`/admin/announcements/campaigns/${result.id}`);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const handleSend = () => {
    if (!canSend || !validate()) return;
    setConfirmOpen(true);
  };

  const confirmSend = () => {
    startTransition(async () => {
      try {
        const payload = buildPayload();
        const result = scheduledAt
          ? await saveAnnouncementDraft(payload)
          : await sendAnnouncementNow({ ...payload, scheduled_at: null });
        setConfirmOpen(false);
        toast.success(scheduledAt ? t('admin.announcements.scheduled') : t('admin.announcements.sendStarted'));
        router.push(`/admin/announcements/campaigns/${result.id}`);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.announcements.campaigns', href: '/admin/announcements/campaigns', icon: Megaphone },
          { labelKey: 'admin.announcements.send', icon: Send },
        ]}
        title={t('admin.announcements.sendTitle')}
        countLabel=""
        filters={
          <ButtonLink href="/admin/announcements/campaigns" variant="outline" size="sm">
            {t('admin.announcements.viewCampaigns')}
          </ButtonLink>
        }
      />

      {!canSend ? (
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t('admin.announcements.sendPermissionRequired')}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <label htmlFor="announcement-title" className="mb-1.5 block text-sm font-medium text-gray-700">
              {t('admin.announcements.fieldTitle')}
            </label>
            <input
              id="announcement-title"
              type="text"
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!canSend || isPending}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-brand/30 focus:border-brand focus:ring-2"
              placeholder={t('admin.announcements.titlePlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t('admin.announcements.fieldBody')}
            </label>
            <AnnouncementRichEditor
              value={bodyHtml}
              onChange={setBodyHtml}
              disabled={!canSend || isPending}
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-primary-dark">{t('admin.announcements.deliverySettings')}</h2>

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="announcement-audience" className="mb-1 block text-xs font-medium text-gray-600">
                  {t('admin.announcements.fieldAudience')}
                </label>
                <select
                  id="announcement-audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
                  disabled={!canSend || isPending}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                >
                  {AUDIENCES.map((value) => (
                    <option key={value} value={value}>
                      {t(`admin.announcements.audience.${value}` as const)}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-gray-500">
                  {audienceCount != null
                    ? t('admin.announcements.estimatedRecipients').replace('{count}', String(audienceCount))
                    : t('admin.announcements.estimating')}
                </p>
              </div>

              <div>
                <label htmlFor="announcement-schedule" className="mb-1 block text-xs font-medium text-gray-600">
                  {t('admin.announcements.fieldSchedule')}
                </label>
                <input
                  id="announcement-schedule"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  disabled={!canSend || isPending}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
                <p className="mt-1 text-xs text-gray-500">{t('admin.announcements.scheduleHint')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-primary-dark">{t('admin.announcements.pushPreview')}</h2>
            <div className="mt-3 rounded-xl bg-gray-50 p-3">
              <p className="text-sm font-semibold text-primary-dark">{title.trim() || t('admin.announcements.untitled')}</p>
              <p className="mt-1 text-xs text-gray-600 line-clamp-3">
                {pushPreview || t('admin.announcements.pushPreviewEmpty')}
              </p>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">{t('admin.announcements.pushPreviewNote')}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" disabled={!canSend || isPending} onClick={() => setShowPreview((v) => !v)}>
              {showPreview ? t('admin.announcements.hidePreview') : t('admin.announcements.showPreview')}
            </Button>
            <Button type="button" variant="outline" disabled={!canSend || isPending} onClick={handleSaveDraft}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t('admin.announcements.saveDraft')}
            </Button>
            <Button type="button" disabled={!canSend || isPending} onClick={handleSend}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {scheduledAt ? t('admin.announcements.scheduleSend') : t('admin.announcements.sendNow')}
            </Button>
          </div>
        </aside>
      </div>

      {showPreview ? (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-primary-dark">{t('admin.announcements.inAppPreview')}</h2>
          <AnnouncementHtmlPreview html={sanitizedPreview} />
        </section>
      ) : null}

      <ConfirmModal
        open={confirmOpen}
        title={scheduledAt ? t('admin.announcements.scheduleConfirmTitle') : t('admin.announcements.sendConfirmTitle')}
        description={
          scheduledAt
            ? t('admin.announcements.scheduleConfirmDescription')
            : t('admin.announcements.sendConfirm')
        }
        confirmText={scheduledAt ? t('admin.announcements.scheduleSend') : t('admin.announcements.sendNow')}
        cancelText={t('admin.cancel')}
        loading={isPending}
        showCannotUndo={!scheduledAt}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmSend}
      />
    </div>
  );
}
