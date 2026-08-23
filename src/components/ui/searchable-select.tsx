'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

export interface SearchableSelectOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  value: string;
  selectedLabel?: string;
  onChange: (id: string, label: string) => void;
  fetchOptions: (query: string) => Promise<SearchableSelectOption[]>;
  placeholder: string;
  className?: string;
}

export function SearchableSelect({
  value,
  selectedLabel,
  onChange,
  fetchOptions,
  placeholder,
  className,
}: SearchableSelectProps) {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<SearchableSelectOption[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    fetchOptions(debouncedQuery)
      .then((results) => {
        if (!cancelled) setOptions(results);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open, fetchOptions]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (option: SearchableSelectOption) => {
    onChange(option.id, option.label);
    setQuery('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange('', '');
    setQuery('');
  };

  const showChip = Boolean(value) && !open;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {showChip ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-brand/30 bg-brand-muted px-3 text-sm text-brand-dark"
        >
          <span className="truncate">{selectedLabel || value}</span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="shrink-0 rounded-full p-0.5 hover:bg-brand/15"
            aria-label={t('admin.clearSelection')}
          >
            <X className="h-3.5 w-3.5" />
          </span>
        </button>
      ) : (
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white ps-9 pe-3 text-sm outline-none focus:border-brand/40"
          />
        </div>
      )}

      {open && !showChip ? (
        <div className="absolute start-0 top-full z-20 mt-1.5 max-h-64 w-full min-w-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-[var(--shadow-float)]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : options.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-gray-400">{t('admin.noResults')}</p>
          ) : (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className="block w-full rounded-lg px-3 py-2 text-start text-sm hover:bg-gray-50"
              >
                <span className="block truncate font-medium text-primary-dark">{option.label}</span>
                {option.sublabel ? <span className="block truncate text-xs text-gray-400">{option.sublabel}</span> : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
