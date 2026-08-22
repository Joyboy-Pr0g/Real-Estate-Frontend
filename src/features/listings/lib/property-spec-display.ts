import { PropertySpecSchema } from '@/features/catalog/types/property-subtype';
import { ListingPropertySpecs } from '@/features/listings/types/listing-detail';

export function humanizeSpecKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

export function getSpecFieldLabel(
  key: string,
  schema: PropertySpecSchema | null | undefined,
): string {
  return schema?.fields[key]?.label ?? humanizeSpecKey(key);
}

export function formatSpecDisplayValue(
  key: string,
  value: string | number | boolean,
  schema: PropertySpecSchema | null | undefined,
  labels: { yes: string; no: string },
): string {
  const field = schema?.fields[key];

  if (typeof value === 'boolean') {
    return value ? labels.yes : labels.no;
  }

  if (field?.type === 'enum') {
    return field.options?.find((option) => option.value === String(value))?.label ?? String(value);
  }

  return String(value);
}

export function getOrderedSpecEntries(
  specs: ListingPropertySpecs,
  schema: PropertySpecSchema | null | undefined,
): [string, string | number | boolean][] {
  if (!schema?.fields) {
    return Object.entries(specs);
  }

  const ordered: [string, string | number | boolean][] = [];
  const seen = new Set<string>();

  for (const key of Object.keys(schema.fields)) {
    if (!(key in specs)) continue;
    ordered.push([key, specs[key]]);
    seen.add(key);
  }

  for (const [key, value] of Object.entries(specs)) {
    if (seen.has(key)) continue;
    ordered.push([key, value]);
  }

  return ordered;
}

const HIGHLIGHT_SPEC_KEYS = [
  'number_of_rooms',
  'bedrooms_count',
  'area_sqm_gross',
  'area_sqm_net',
  'area_sqm',
  'floor_number',
];

export function getHighlightSpecKeys(
  specs: ListingPropertySpecs,
  schema: PropertySpecSchema | null | undefined,
  limit = 3,
): string[] {
  const keys: string[] = [];

  for (const key of HIGHLIGHT_SPEC_KEYS) {
    if (!(key in specs)) continue;
    keys.push(key);
    if (keys.length >= limit) return keys;
  }

  if (schema?.fields) {
    for (const key of Object.keys(schema.fields)) {
      if (keys.length >= limit) break;
      if (key in specs && !keys.includes(key)) keys.push(key);
    }
  }

  for (const key of Object.keys(specs)) {
    if (keys.length >= limit) break;
    if (!keys.includes(key)) keys.push(key);
  }

  return keys.slice(0, limit);
}
