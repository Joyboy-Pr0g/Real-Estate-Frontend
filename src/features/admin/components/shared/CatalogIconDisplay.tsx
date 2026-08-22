'use client';

import { getCatalogIcon } from '@/features/catalog/utils/catalog-icons';
import { cn } from '@/lib/utils/cn';

interface CatalogIconDisplayProps {
  icon: string | null | undefined;
  className?: string;
  iconClassName?: string;
}

export function CatalogIconDisplay({
  icon,
  className,
  iconClassName = 'h-4 w-4 text-brand',
}: CatalogIconDisplayProps) {
  if (!icon) {
    return <span className={cn('text-gray-400', className)}>—</span>;
  }

  const Icon = getCatalogIcon(icon);

  return (
    <span className={cn('inline-flex items-center', className)} title={icon}>
      <Icon className={iconClassName} aria-hidden />
      <span className="sr-only">{icon}</span>
    </span>
  );
}
