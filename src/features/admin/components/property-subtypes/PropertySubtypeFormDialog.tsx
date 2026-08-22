'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  createPropertySubtype,
  updatePropertySubtype,
} from '@/features/admin/services/admin-catalog-client';
import { SpecSchemaBuilder } from '@/features/admin/components/property-subtypes/SpecSchemaBuilder';
import {
  AdminPropertySubtype,
  AdminPropertyType,
  PropertySubtypePayload,
} from '@/features/admin/types/catalog';
import {
  fieldDraftsToSchema,
  schemaToFieldDrafts,
  specSchemasEqual,
  SpecFieldDraft,
  validateFieldDrafts,
  type SpecFieldDraftErrorKey,
} from '@/features/admin/lib/spec-schema-builder';
import { buildPartialUpdate, hasPartialChanges } from '@/features/admin/lib/partial-update';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';
import { X } from 'lucide-react';
import { IconPickerDropdown } from '@/features/admin/components/shared/IconPickerDropdown';

interface PropertySubtypeFormDialogProps {
  open: boolean;
  item: AdminPropertySubtype | null;
  propertyTypes: AdminPropertyType[];
  onClose: () => void;
  onSaved: () => void;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

const VALIDATION_MESSAGES: Record<SpecFieldDraftErrorKey, TranslationKey> = {
  keyRequired: 'admin.specError.keyRequired',
  keyDuplicate: 'admin.specError.keyDuplicate',
  keyInvalid: 'admin.specError.keyInvalid',
  labelRequired: 'admin.specError.labelRequired',
  enumOptionsRequired: 'admin.specError.enumOptionsRequired',
  minInvalid: 'admin.specError.minInvalid',
  maxInvalid: 'admin.specError.maxInvalid',
};

export function PropertySubtypeFormDialog({
  open,
  item,
  propertyTypes,
  onClose,
  onSaved,
}: PropertySubtypeFormDialogProps) {
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [icon, setIcon] = useState('');
  const [specFields, setSpecFields] = useState<SpecFieldDraft[]>([]);
  const [highlightFieldId, setHighlightFieldId] = useState<string | null>(null);
  const [specExpanded, setSpecExpanded] = useState(true);

  useEffect(() => {
    if (!open) return;
    setName(item?.name ?? '');
    setPropertyTypeId(item?.property_type_id ?? propertyTypes[0]?.id ?? '');
    setIcon(item?.icon ?? '');
    setSpecFields(schemaToFieldDrafts(item?.spec_schema));
    setHighlightFieldId(null);
    setSpecExpanded(Object.keys(item?.spec_schema?.fields ?? {}).length > 0);
  }, [open, item, propertyTypes]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const validation = validateFieldDrafts(specFields);
    if (!validation.valid) {
      setHighlightFieldId(validation.fieldId ?? null);
      toast.error(t(VALIDATION_MESSAGES[validation.errorKey]));
      return;
    }

    startTransition(async () => {
      try {
        const spec_schema = fieldDraftsToSchema(specFields);

        if (item) {
          const next = {
            name: name.trim(),
            property_type_id: propertyTypeId,
            icon: icon.trim(),
            spec_schema,
          };
          const original = {
            name: item.name,
            property_type_id: item.property_type_id,
            icon: item.icon,
            spec_schema: item.spec_schema,
          };
          const patch = buildPartialUpdate(next, original, {
            spec_schema: specSchemasEqual,
          });

          if (!hasPartialChanges(patch)) {
            toast.info(t('admin.noChanges'));
            return;
          }

          await updatePropertySubtype(item.id, patch);
          toast.success(t('admin.propertySubtypeUpdated'));
        } else {
          const payload: PropertySubtypePayload = {
            name: name.trim(),
            property_type_id: propertyTypeId,
            icon: icon.trim(),
            ...(Object.keys(spec_schema.fields).length > 0 ? { spec_schema } : {}),
          };
          await createPropertySubtype(payload);
          toast.success(t('admin.propertySubtypeCreated'));
        }
        onSaved();
        onClose();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]">
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label={t('admin.close')}
            className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="ps-10 text-lg font-bold text-primary-dark">
            {item ? t('admin.editPropertySubtype') : t('admin.createPropertySubtype')}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-primary-dark">{t('admin.catalogName')}</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-primary-dark">{t('admin.propertyType')}</span>
              <select
                required
                value={propertyTypeId}
                onChange={(e) => setPropertyTypeId(e.target.value)}
                className={fieldClass}
              >
                {propertyTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-primary-dark">{t('admin.catalogIcon')}</span>
              <IconPickerDropdown
                required
                value={icon}
                onChange={setIcon}
              />
            </label>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
            <SpecSchemaBuilder
              fields={specFields}
              onChange={setSpecFields}
              highlightFieldId={highlightFieldId}
              expanded={specExpanded}
              onExpandedChange={setSpecExpanded}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {t('admin.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
