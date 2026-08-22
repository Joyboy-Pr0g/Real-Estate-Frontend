'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PropertySpecField,
  PropertySpecSchema,
} from '@/features/catalog/types/property-subtype';
import {
  appendSpecToSearchParams,
  clearSpecFromSearchParams,
  countActiveSpecFilters,
  parseSpecFromSearchParams,
} from '@/features/listings/lib/spec-url';
import { ListingSpecFilters } from '@/features/listings/types/spec-filters';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { useEffect, useMemo, useState } from 'react';

interface SpecFiltersPanelProps {
  open: boolean;
  schema: PropertySpecSchema | null;
  searchParams: URLSearchParams;
  onClose: () => void;
  onApply: (nextParams: URLSearchParams) => void;
}

function getFilterableFields(schema: PropertySpecSchema | null): [string, PropertySpecField][] {
  if (!schema) return [];
  return Object.entries(schema.fields).filter(([, field]) => field.filterable);
}

export function SpecFiltersPanel({
  open,
  schema,
  searchParams,
  onClose,
  onApply,
}: SpecFiltersPanelProps) {
  const { t } = useLocale();
  const filterableFields = useMemo(() => getFilterableFields(schema), [schema]);
  const [draft, setDraft] = useState<ListingSpecFilters>({});

  useEffect(() => {
    if (!open) return;
    setDraft(parseSpecFromSearchParams(searchParams));
  }, [open, searchParams]);

  const apply = () => {
    const next = new URLSearchParams(searchParams.toString());
    clearSpecFromSearchParams(next);
    appendSpecToSearchParams(next, draft);
    next.delete('cursor');
    onApply(next);
    onClose();
  };

  const clear = () => {
    const next = new URLSearchParams(searchParams.toString());
    clearSpecFromSearchParams(next);
    next.delete('cursor');
    onApply(next);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={t('filters.closeSpec')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-primary-dark/20 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto max-h-[min(80vh,560px)] max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-float md:inset-x-auto md:start-1/2 md:bottom-auto md:top-1/2 md:w-full md:-translate-x-1/2 md:-translate-y-1/2 rtl:md:translate-x-1/2"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-primary-dark">{t('filters.specTitle')}</p>
                  <p className="text-xs text-gray-500">{t('filters.specSubtitle')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[min(52vh,420px)] overflow-y-auto px-5 py-4 space-y-4">
              {filterableFields.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">{t('filters.noSpecFields')}</p>
              ) : (
                filterableFields.map(([fieldName, field]) => (
                  <SpecFieldInput
                    key={fieldName}
                    fieldName={fieldName}
                    field={field}
                    value={draft[fieldName]}
                    onChange={(value) =>
                      setDraft((current) => {
                        const next = { ...current };
                        if (
                          value === undefined
                          || value === ''
                          || (typeof value === 'object'
                            && value.min === undefined
                            && value.max === undefined)
                        ) {
                          delete next[fieldName];
                        } else {
                          next[fieldName] = value;
                        }
                        return next;
                      })
                    }
                  />
                ))
              )}
            </div>

            <div className="flex gap-2 border-t border-gray-100 px-5 py-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={clear}>
                {t('filters.clearSpec')}
              </Button>
              <Button size="sm" className="flex-1" onClick={apply}>
                {t('filters.applySpec')}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface SpecFieldInputProps {
  fieldName: string;
  field: PropertySpecField;
  value: ListingSpecFilters[string] | undefined;
  onChange: (value: ListingSpecFilters[string] | undefined) => void;
}

function SpecFieldInput({ fieldName, field, value, onChange }: SpecFieldInputProps) {
  if (field.type === 'boolean') {
    const checked = value === true;
    return (
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
        <span className="text-sm font-medium text-primary-dark">{field.label}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked ? true : undefined)}
          className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary/30"
        />
      </label>
    );
  }

  if (field.type === 'enum') {
    const selected = typeof value === 'string' ? value : '';
    return (
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-primary-dark">{field.label}</span>
        <select
          value={selected}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300"
        >
          <option value="">—</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === 'number') {
    const range =
      typeof value === 'object' && value !== null && ('min' in value || 'max' in value)
        ? value
        : {};
    return (
      <div>
        <span className="mb-2 block text-sm font-medium text-primary-dark">{field.label}</span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={range.min ?? ''}
            min={field.min}
            onChange={(e) => {
              const min = e.target.value ? Number(e.target.value) : undefined;
              const max = range.max;
              if (min === undefined && max === undefined) onChange(undefined);
              else onChange({ min, max });
            }}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={range.max ?? ''}
            min={field.min}
            onChange={(e) => {
              const max = e.target.value ? Number(e.target.value) : undefined;
              const min = range.min;
              if (min === undefined && max === undefined) onChange(undefined);
              else onChange({ min, max });
            }}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300"
          />
        </div>
      </div>
    );
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-primary-dark">{field.label}</span>
      <input
        type="text"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300"
      />
    </label>
  );
}

export function SpecFiltersTrigger({
  count,
  onClick,
  className,
}: {
  count: number;
  onClick: () => void;
  className?: string;
}) {
  const { t } = useLocale();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-all',
        count > 0
          ? 'border-secondary/30 bg-secondary/5 text-secondary-dark'
          : 'border-gray-200 bg-white text-primary-dark hover:border-gray-300 hover:shadow-sm',
        className,
      )}
    >
      <SlidersHorizontal className="h-4 w-4" />
      <span>{t('filters.moreOptions')}</span>
      {count > 0 ? (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[10px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}
