import type { PropertySpecField, PropertySpecSchema } from '@/features/catalog/types/property-subtype';

export type SpecFieldType = PropertySpecField['type'];

export interface SpecFieldDraft {
  id: string;
  key: string;
  type: SpecFieldType;
  label: string;
  required: boolean;
  filterable: boolean;
  min: string;
  max: string;
  options: { value: string; label: string }[];
}

function newDraftId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createEmptyFieldDraft(): SpecFieldDraft {
  return {
    id: newDraftId(),
    key: '',
    type: 'number',
    label: '',
    required: false,
    filterable: true,
    min: '',
    max: '',
    options: [{ value: '', label: '' }],
  };
}

export function schemaToFieldDrafts(schema?: PropertySpecSchema | null): SpecFieldDraft[] {
  if (!schema?.fields || Object.keys(schema.fields).length === 0) {
    return [];
  }

  return Object.entries(schema.fields).map(([key, field]) => ({
    id: newDraftId(),
    key,
    type: field.type,
    label: field.label,
    required: field.required,
    filterable: field.filterable ?? false,
    min: field.min !== undefined ? String(field.min) : '',
    max: field.max !== undefined ? String(field.max) : '',
    options:
      field.type === 'enum' && field.options?.length
        ? field.options.map((option) => ({ ...option }))
        : [{ value: '', label: '' }],
  }));
}

export function fieldDraftsToSchema(drafts: SpecFieldDraft[]): PropertySpecSchema {
  const fields: Record<string, PropertySpecField> = {};

  for (const draft of drafts) {
    const key = draft.key.trim();
    if (!key) continue;

    const field: PropertySpecField = {
      type: draft.type,
      label: draft.label.trim(),
      required: draft.required,
      filterable: draft.filterable,
    };

    if (draft.type === 'number') {
      if (draft.min.trim()) field.min = Number(draft.min);
      if (draft.max.trim()) field.max = Number(draft.max);
    }

    if (draft.type === 'enum') {
      field.options = draft.options
        .filter((option) => option.value.trim() && option.label.trim())
        .map((option) => ({
          value: option.value.trim(),
          label: option.label.trim(),
        }));
    }

    fields[key] = field;
  }

  return { fields };
}

export type SpecFieldDraftErrorKey =
  | 'keyRequired'
  | 'keyDuplicate'
  | 'keyInvalid'
  | 'labelRequired'
  | 'enumOptionsRequired'
  | 'minInvalid'
  | 'maxInvalid';

export function validateFieldDrafts(
  drafts: SpecFieldDraft[],
): { valid: true } | { valid: false; errorKey: SpecFieldDraftErrorKey; fieldId?: string } {
  const seenKeys = new Set<string>();

  for (const draft of drafts) {
    const key = draft.key.trim();
    if (!key) {
      return { valid: false, errorKey: 'keyRequired', fieldId: draft.id };
    }
    if (!/^[a-z][a-z0-9_]*$/.test(key)) {
      return { valid: false, errorKey: 'keyInvalid', fieldId: draft.id };
    }
    if (seenKeys.has(key)) {
      return { valid: false, errorKey: 'keyDuplicate', fieldId: draft.id };
    }
    seenKeys.add(key);

    if (!draft.label.trim()) {
      return { valid: false, errorKey: 'labelRequired', fieldId: draft.id };
    }

    if (draft.type === 'number') {
      if (draft.min.trim() && Number.isNaN(Number(draft.min))) {
        return { valid: false, errorKey: 'minInvalid', fieldId: draft.id };
      }
      if (draft.max.trim() && Number.isNaN(Number(draft.max))) {
        return { valid: false, errorKey: 'maxInvalid', fieldId: draft.id };
      }
    }

    if (draft.type === 'enum') {
      const validOptions = draft.options.filter(
        (option) => option.value.trim() && option.label.trim(),
      );
      if (validOptions.length === 0) {
        return { valid: false, errorKey: 'enumOptionsRequired', fieldId: draft.id };
      }
    }
  }

  return { valid: true };
}

export function specSchemasEqual(
  a?: PropertySpecSchema | null,
  b?: PropertySpecSchema | null,
): boolean {
  const normalizedA = fieldDraftsToSchema(schemaToFieldDrafts(a));
  const normalizedB = fieldDraftsToSchema(schemaToFieldDrafts(b));
  return JSON.stringify(normalizedA) === JSON.stringify(normalizedB);
}
