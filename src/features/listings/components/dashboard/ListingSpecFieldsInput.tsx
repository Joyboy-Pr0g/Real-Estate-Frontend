'use client';

import { PropertySpecField, PropertySpecSchema } from '@/features/catalog/types/property-subtype';
import { ListingPropertySpecs } from '@/features/listings/types/listing-detail';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ListingSpecFieldsInputProps {
  schema: PropertySpecSchema;
  values: ListingPropertySpecs;
  onChange: (fieldName: string, value: string | number | boolean | undefined) => void;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

export function ListingSpecFieldsInput({ schema, values, onChange }: ListingSpecFieldsInputProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Object.entries(schema.fields).map(([fieldName, field]) => (
        <SpecField
          key={fieldName}
          field={field}
          value={values[fieldName]}
          onChange={(value) => onChange(fieldName, value)}
        />
      ))}
    </div>
  );
}

interface SpecFieldProps {
  field: PropertySpecField;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean | undefined) => void;
}

function SpecField({ field, value, onChange }: SpecFieldProps) {
  const { t } = useLocale();

  if (field.type === 'boolean') {
    const choiceClass = (active: boolean) =>
      cn(
        'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-brand bg-brand-muted text-brand-dark shadow-sm'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
      );

    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 sm:col-span-2">
        <span className="text-sm font-medium text-primary-dark flex items-center gap-2">
          {field.label}
          {field.required ? <span className="text-xs text-red-500">*</span> : null}
        </span>
        <div className="mt-2 flex gap-2" role="group" aria-label={field.label}>
          <button type="button" className={choiceClass(value === true)} onClick={() => onChange(true)}>
            {t('detail.specs.yes')}
          </button>
          <button type="button" className={choiceClass(value === false)} onClick={() => onChange(false)}>
            {t('detail.specs.no')}
          </button>
        </div>
      </div>
    );
  }

  if (field.type === 'enum') {
    return (
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-primary-dark flex items-center gap-2">
          {field.label}
          {field.required ? <span className="text-xs text-red-500">*</span> : ''}
        </span>
        <select
          required={field.required}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className={fieldClass}
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
    return (
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-primary-dark flex items-center gap-2">
          {field.label}
          {field.required ? <span className="text-xs text-red-500">*</span> : ''}
        </span>
        <input
          type="number"
          required={field.required}
          min={field.min}
          max={field.max}
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className={fieldClass}
        />
      </label>
    );
  }

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-primary-dark flex items-center gap-2">
        {field.label}
        {field.required ? <span className="text-xs text-red-500">*</span> : ''}
      </span>
      <input
        type="text"
        required={field.required}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className={fieldClass}
      />
    </label>
  );
}
