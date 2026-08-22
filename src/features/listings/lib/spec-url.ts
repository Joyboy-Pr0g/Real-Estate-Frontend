import { ListingSpecFilters, ListingSpecNumberFilter } from '@/features/listings/types/spec-filters';

const SPEC_MIN_MAX_PATTERN = /^spec\[([^\]]+)\]\[(min|max)\]$/;
const SPEC_DIRECT_PATTERN = /^spec\[([^\]]+)\]$/;

function isNumberFilter(value: ListingSpecFilters[string]): value is ListingSpecNumberFilter {
  return typeof value === 'object' && value !== null && ('min' in value || 'max' in value);
}

export function parseSpecFromUrlEntries(entries: Iterable<[string, string]>): ListingSpecFilters {
  const spec: ListingSpecFilters = {};

  for (const [key, rawValue] of entries) {
    if (!rawValue.trim()) continue;

    const minMaxMatch = key.match(SPEC_MIN_MAX_PATTERN);
    if (minMaxMatch) {
      const fieldName = minMaxMatch[1]!;
      const bound = minMaxMatch[2] as 'min' | 'max';
      const current: ListingSpecNumberFilter = isNumberFilter(spec[fieldName])
        ? { ...(spec[fieldName] as ListingSpecNumberFilter) }
        : {};
      current[bound] = Number(rawValue);
      spec[fieldName] = current;
      continue;
    }

    const directMatch = key.match(SPEC_DIRECT_PATTERN);
    if (!directMatch) continue;

    const fieldName = directMatch[1]!;
    const normalized = rawValue.trim().toLowerCase();
    if (normalized === 'true' || normalized === 'false') {
      spec[fieldName] = normalized === 'true';
    } else {
      spec[fieldName] = rawValue.trim();
    }
  }

  return spec;
}

export function parseSpecFromSearchParams(params: URLSearchParams): ListingSpecFilters {
  return parseSpecFromUrlEntries(params.entries());
}

export function parseSpecFromRecord(
  params: Record<string, string | string[] | undefined>,
): ListingSpecFilters {
  const entries: [string, string][] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const resolved = Array.isArray(value) ? value[0] : value;
    if (resolved) entries.push([key, resolved]);
  }
  return parseSpecFromUrlEntries(entries);
}

export function appendSpecToSearchParams(
  params: URLSearchParams,
  spec: ListingSpecFilters,
): void {
  for (const [field, value] of Object.entries(spec)) {
    if (typeof value === 'boolean') {
      params.set(`spec[${field}]`, value ? 'true' : 'false');
      continue;
    }

    if (typeof value === 'string' && value.trim()) {
      params.set(`spec[${field}]`, value.trim());
      continue;
    }

    if (isNumberFilter(value)) {
      if (value.min !== undefined) {
        params.set(`spec[${field}][min]`, String(value.min));
      }
      if (value.max !== undefined) {
        params.set(`spec[${field}][max]`, String(value.max));
      }
    }
  }
}

export function clearSpecFromSearchParams(params: URLSearchParams): void {
  for (const key of [...params.keys()]) {
    if (key.startsWith('spec[')) params.delete(key);
  }
}

export function countActiveSpecFilters(spec: ListingSpecFilters): number {
  return Object.values(spec).filter((value) => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'boolean') return true;
    if (isNumberFilter(value)) return value.min !== undefined || value.max !== undefined;
    return false;
  }).length;
}
