'use client';

import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatIconLabel, getCatalogIcon } from '@/features/catalog/utils/catalog-icons';
import {
  formatIconKeyLabel,
  getLucideIconByKey,
  searchLucideIcons,
  type LucideIconEntry,
} from '@/features/catalog/utils/lucide-icon-registry';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface IconPickerDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

function resolveCurrentEntry(value: string): LucideIconEntry | null {
  if (!value) return null;

  const lucideIcon = getLucideIconByKey(value);
  if (!lucideIcon) return null;

  return {
    key: value,
    lucideName: value,
    Icon: lucideIcon,
    searchText: value,
  };
}

export function IconPickerDropdown({
  value,
  onChange,
  disabled = false,
  required = false,
  className,
}: IconPickerDropdownProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }

    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const filteredIcons = useMemo(() => searchLucideIcons(query), [query]);

  const displayIcons = useMemo(() => {
    if (!value) return filteredIcons;

    const exists = filteredIcons.some((entry) => entry.key === value);
    if (exists) return filteredIcons;

    const current = resolveCurrentEntry(value);
    return current ? [current, ...filteredIcons] : filteredIcons;
  }, [filteredIcons, value]);

  const SelectedIcon = getCatalogIcon(value);

  return (
    <div className={className}>
      {required ? (
        <input
          type="text"
          required
          value={value}
          readOnly
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
      ) : null}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-colors',
              'focus:border-brand/40 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50',
              value ? 'text-primary-dark' : 'text-gray-400',
            )}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              {value ? (
                <>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
                    <SelectedIcon className="h-4 w-4" />
                  </span>
                  <span className="truncate font-medium">{formatIconLabel(value)}</span>
                </>
              ) : (
                t('admin.selectIcon')
              )}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[min(22rem,calc(100vw-2rem))] p-2"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div
            className="sticky top-0 z-10 bg-white pb-2"
            onKeyDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('admin.searchIconsPlaceholder')}
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pe-3 ps-9 text-sm outline-none focus:border-brand/40 focus:bg-white"
              />
            </div>
            <p className="mt-2 px-1 text-[11px] text-gray-500">
              {query.trim()
                ? t('admin.searchIconsResults').replace('{count}', String(displayIcons.length))
                : t('admin.searchIconsHint')}
            </p>
          </div>

          {displayIcons.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-gray-500">{t('admin.searchIconsEmpty')}</p>
          ) : (
            <div className="grid max-h-64 grid-cols-2 gap-1 overflow-y-auto sm:grid-cols-3">
              {displayIcons.map((entry) => {
                const Icon = entry.Icon;
                const selected = value === entry.key;

                return (
                  <DropdownMenuItem
                    key={entry.key}
                    onSelect={() => {
                      onChange(entry.key);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center',
                      selected && 'bg-brand-muted text-brand-dark focus:bg-brand-muted',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        selected ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="w-full truncate text-[11px] font-medium leading-tight">
                      {formatIconKeyLabel(entry.key)}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
