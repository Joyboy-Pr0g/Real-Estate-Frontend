import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SpecTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  wide?: boolean;
  colspanClass?: string;
}

export function SpecTile({ icon: Icon, label, value, wide = false, colspanClass = 'col-span-1' }: SpecTileProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl bg-gray-50/70 p-3',
        colspanClass,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
      <div className="min-w-0">
        <p className="text-[11px] text-gray-500">{label}</p>
        <p
          className={cn(
            'text-sm font-semibold text-primary-dark',
            wide ? 'line-clamp-2' : 'truncate',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
