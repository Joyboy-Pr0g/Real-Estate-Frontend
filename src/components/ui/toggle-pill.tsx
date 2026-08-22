'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface TogglePillProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function TogglePill({
  checked,
  onCheckedChange,
  label,
  icon,
  disabled = false,
  className,
  id,
}: TogglePillProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex h-11 shrink-0 cursor-pointer items-center gap-3 rounded-xl border px-4 transition-all select-none',
        checked
          ? 'border-brand/40 bg-brand-muted text-brand-dark shadow-sm'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          'flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-md border transition-all',
          checked ? 'border-brand bg-brand text-white' : 'border-gray-300 bg-gray-50',
        )}
      >
        {checked ? <Check size={12} strokeWidth={3} /> : null}
      </span>
      {icon ? <span className={cn('shrink-0', checked ? 'text-brand' : 'text-gray-400')}>{icon}</span> : null}
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    </label>
  );
}
