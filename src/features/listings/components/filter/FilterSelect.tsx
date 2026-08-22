'use client';

import { cn } from '@/lib/utils/cn';

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

export function FilterSelect({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  children,
  className,
}: FilterSelectProps) {
  return (
    <label className={cn('block min-w-[9.5rem] sm:min-w-[10.5rem] md:min-w-[11.5rem]', className)}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/80 px-3 pe-9 text-sm font-medium text-primary-dark',
            'outline-none transition-[border-color,background-color,box-shadow] duration-200',
            'focus:border-gray-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(30,41,59,0.06)]',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {children}
        </select>
        <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-gray-400">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </div>
    </label>
  );
}

interface FilterPriceInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function FilterPriceInput({
  label,
  value,
  onChange,
  placeholder,
  onFocus,
  onBlur,
}: FilterPriceInputProps) {
  return (
    <label className="block min-w-[7.5rem] sm:min-w-[8.5rem]">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 text-sm font-medium text-primary-dark outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:border-gray-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(30,41,59,0.06)]"
      />
    </label>
  );
}
