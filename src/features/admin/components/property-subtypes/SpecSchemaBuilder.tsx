'use client';

import { ChevronDown, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TogglePill } from '@/components/ui/toggle-pill';
import { FilterExpandPanel } from '@/features/listings/components/filter/FilterSegment';
import {
  createEmptyFieldDraft,
  SpecFieldDraft,
  SpecFieldType,
} from '@/features/admin/lib/spec-schema-builder';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';
import { cn } from '@/lib/utils/cn';

const FIELD_TYPES: SpecFieldType[] = ['string', 'number', 'boolean', 'enum'];

const TYPE_LABEL_KEYS: Record<SpecFieldType, TranslationKey> = {
  string: 'admin.specFieldType.string',
  number: 'admin.specFieldType.number',
  boolean: 'admin.specFieldType.boolean',
  enum: 'admin.specFieldType.enum',
};

interface SpecSchemaBuilderProps {
  fields: SpecFieldDraft[];
  onChange: (fields: SpecFieldDraft[]) => void;
  highlightFieldId?: string | null;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const inputClass =
  'h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand/40';

export function SpecSchemaBuilder({
  fields,
  onChange,
  highlightFieldId,
  expanded: expandedProp,
  onExpandedChange,
}: SpecSchemaBuilderProps) {
  const { t } = useLocale();
  const [expandedInternal, setExpandedInternal] = useState(true);
  const expanded = expandedProp ?? expandedInternal;

  const setExpanded = (value: boolean) => {
    onExpandedChange?.(value);
    if (expandedProp === undefined) {
      setExpandedInternal(value);
    }
  };

  useEffect(() => {
    if (highlightFieldId) {
      setExpanded(true);
    }
  }, [highlightFieldId]);

  const toggleExpanded = () => setExpanded(!expanded);

  const updateField = (id: string, patch: Partial<SpecFieldDraft>) => {
    onChange(
      fields.map((field) => {
        if (field.id !== id) return field;
        const next = { ...field, ...patch };
        if (patch.type && patch.type !== field.type) {
          if (patch.type === 'enum' && next.options.length === 0) {
            next.options = [{ value: '', label: '' }];
          }
        }
        return next;
      }),
    );
  };

  const removeField = (id: string) => {
    onChange(fields.filter((field) => field.id !== id));
  };

  const addField = () => {
    onChange([...fields, createEmptyFieldDraft()]);
  };

  return (
    <section className="space-y-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary-dark">{t('admin.specSchema')}</p>
            <p className="text-xs text-gray-500">
              {expanded
                ? t('admin.specSchemaHint')
                : t('admin.specFieldCount').replace('{count}', String(fields.length))}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label={expanded ? t('admin.collapseSpecSchema') : t('admin.expandSpecSchema')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-primary-dark"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', expanded && 'rotate-180')} />
          </button>
          <Button type="button" variant="outline" size="sm" onClick={addField} className="rounded-xl">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('admin.addSpecField')}</span>
          </Button>
        </div>
      </div>

      <FilterExpandPanel open={expanded} compact>
        <div className="space-y-3 pt-3">
          {fields.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
              <p className="text-sm text-gray-500">{t('admin.noSpecFields')}</p>
              <Button type="button" variant="outline" size="sm" onClick={addField} className="mt-3 rounded-xl">
                <Plus className="h-4 w-4" />
                {t('admin.addSpecField')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <SpecFieldEditor
                  key={field.id}
                  field={field}
                  index={index}
                  highlighted={field.id === highlightFieldId}
                  onChange={(patch) => updateField(field.id, patch)}
                  onRemove={() => removeField(field.id)}
                />
              ))}
            </div>
          )}
        </div>
      </FilterExpandPanel>
    </section>
  );
}

interface SpecFieldEditorProps {
  field: SpecFieldDraft;
  index: number;
  highlighted?: boolean;
  onChange: (patch: Partial<SpecFieldDraft>) => void;
  onRemove: () => void;
}

function SpecFieldEditor({ field, index, highlighted, onChange, onRemove }: SpecFieldEditorProps) {
  const { t } = useLocale();

  const updateOption = (optionIndex: number, patch: Partial<{ value: string; label: string }>) => {
    onChange({
      options: field.options.map((option, i) =>
        i === optionIndex ? { ...option, ...patch } : option,
      ),
    });
  };

  const addOption = () => {
    onChange({ options: [...field.options, { value: '', label: '' }] });
  };

  const removeOption = (optionIndex: number) => {
    if (field.options.length <= 1) return;
    onChange({ options: field.options.filter((_, i) => i !== optionIndex) });
  };

  return (
    <article
      className={cn(
        'rounded-2xl border bg-white p-4 shadow-[var(--shadow-soft)] transition-colors',
        highlighted ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200',
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {t('admin.specField')} {index + 1}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-primary-dark">
            {field.label.trim() || field.key.trim() || t('admin.newSpecField')}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          aria-label={t('admin.removeSpecField')}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-gray-600">{t('admin.specFieldKey')}</span>
          <input
            value={field.key}
            onChange={(e) => onChange({ key: e.target.value.replace(/\s/g, '_').toLowerCase() })}
            placeholder="area_sqm"
            className={inputClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-gray-600">{t('admin.specFieldLabel')}</span>
          <input
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder={t('admin.specFieldLabelPlaceholder')}
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-3">
        <span className="mb-2 block text-xs font-medium text-gray-600">{t('admin.specFieldTypeLabel')}</span>
        <div className="flex flex-wrap gap-2">
          {FIELD_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ type })}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                field.type === type
                  ? 'bg-brand text-white shadow-sm shadow-brand/20'
                  : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200 hover:ring-brand/25 hover:text-brand-dark',
              )}
            >
              {t(TYPE_LABEL_KEYS[type])}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <TogglePill
          checked={field.required}
          onCheckedChange={(checked) => onChange({ required: checked })}
          label={t('admin.specFieldRequired')}
          className="h-10 px-3 text-xs"
        />
        <TogglePill
          checked={field.filterable}
          onCheckedChange={(checked) => onChange({ filterable: checked })}
          label={t('admin.specFieldFilterable')}
          className="h-10 px-3 text-xs"
        />
      </div>

      {field.type === 'number' ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-gray-600">{t('admin.specFieldMin')}</span>
            <input
              type="number"
              value={field.min}
              onChange={(e) => onChange({ min: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-gray-600">{t('admin.specFieldMax')}</span>
            <input
              type="number"
              value={field.max}
              onChange={(e) => onChange({ max: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>
      ) : null}

      {field.type === 'enum' ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-600">{t('admin.specFieldOptions')}</span>
            <Button type="button" variant="outline" size="sm" onClick={addOption} className="h-8 rounded-lg text-xs">
              <Plus className="h-3.5 w-3.5" />
              {t('admin.addSpecOption')}
            </Button>
          </div>
          <div className="space-y-2">
            {field.options.map((option, optionIndex) => (
              <div key={optionIndex} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  value={option.value}
                  onChange={(e) => updateOption(optionIndex, { value: e.target.value })}
                  placeholder={t('admin.specOptionValue')}
                  className={inputClass}
                />
                <input
                  value={option.label}
                  onChange={(e) => updateOption(optionIndex, { label: e.target.value })}
                  placeholder={t('admin.specOptionLabel')}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeOption(optionIndex)}
                  disabled={field.options.length <= 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 disabled:opacity-40 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {field.type === 'boolean' ? (
        <p className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
          {t('admin.specBooleanHint')}
        </p>
      ) : null}

      {field.type === 'string' ? (
        <p className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
          {t('admin.specStringHint')}
        </p>
      ) : null}
    </article>
  );
}
