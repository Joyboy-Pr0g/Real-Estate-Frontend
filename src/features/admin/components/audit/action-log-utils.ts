import type { TranslationKey } from '@/lib/i18n/ar';

export const ACTION_LABEL_KEYS: Record<string, TranslationKey> = {
  create: 'admin.actionLog.create',
  update: 'admin.actionLog.update',
  delete: 'admin.actionLog.delete',
  soft_delete: 'admin.actionLog.softDelete',
  restore: 'admin.actionLog.restore',
  activate: 'admin.actionLog.activate',
  deactivate: 'admin.actionLog.deactivate',
  approve: 'admin.actionLog.approve',
  reject: 'admin.actionLog.reject',
  status_change: 'admin.actionLog.statusChange',
  admin_draft_listing: 'admin.actionLog.adminDraftListing',
  admin_soft_delete_listing: 'admin.actionLog.adminSoftDeleteListing',
  admin_hard_delete_listing: 'admin.actionLog.adminHardDeleteListing',
  publish_listing: 'admin.actionLog.publishListing',
  draft_listing: 'admin.actionLog.draftListing',
  sold_listing: 'admin.actionLog.soldListing',
  rented_listing: 'admin.actionLog.rentedListing',
  update_listing: 'admin.actionLog.updateListing',
  create_listing: 'admin.actionLog.createListing',
  soft_delete_listing: 'admin.actionLog.softDeleteListing',
};

export function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function getChangeEntries(changes: Record<string, unknown> | null | undefined) {
  if (!changes || typeof changes !== 'object') return [];
  return Object.entries(changes)
    .filter(([key]) => key.trim())
    .map(([key, value]) => ({ key: key.trim(), value: formatChangeValue(value) }));
}
