import { PropertyTypeStatus } from '@/features/admin/types/catalog';
import { cn } from '@/lib/utils/cn';

const styles: Record<PropertyTypeStatus, string> = {
  active: 'bg-brand-muted text-brand-dark',
  inactive: 'bg-gray-100 text-gray-600',
};

export function CatalogStatusBadge({ status, label }: { status: PropertyTypeStatus; label: string }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', styles[status])}>
      {label}
    </span>
  );
}
