import { icons, type LucideIcon } from 'lucide-react';

export interface LucideIconEntry {
  key: string;
  lucideName: string;
  Icon: LucideIcon;
  searchText: string;
}

export function lucideNameToKey(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

export function keyToLucideName(key: string): string {
  return key
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function buildSearchText(key: string, lucideName: string): string {
  return `${key} ${lucideName} ${lucideName.replace(/([a-z])([A-Z])/g, '$1 $2')}`.toLowerCase();
}

export const LUCIDE_ICON_ENTRIES: LucideIconEntry[] = Object.entries(icons)
  .filter(([, component]) => typeof component === 'object' || typeof component === 'function')
  .map(([lucideName, Icon]) => {
    const key = lucideNameToKey(lucideName);
    return {
      key,
      lucideName,
      Icon: Icon as LucideIcon,
      searchText: buildSearchText(key, lucideName),
    };
  })
  .sort((a, b) => a.key.localeCompare(b.key));

const lucideIconByKey = new Map(LUCIDE_ICON_ENTRIES.map((entry) => [entry.key, entry.Icon]));
const lucideIconByName = new Map(LUCIDE_ICON_ENTRIES.map((entry) => [entry.lucideName, entry.Icon]));
const lucideEntryByKey = new Map(LUCIDE_ICON_ENTRIES.map((entry) => [entry.key, entry]));

// Lucide only matches its own literal icon names — plain-language search terms
// (especially furniture/room vocabulary admins actually type) often have no
// name overlap at all. This maps common terms to the icon keys they should
// surface; entries pointing at keys that don't exist in the installed lucide
// version are harmless no-ops (filtered out at lookup time).
const SEARCH_SYNONYMS: Record<string, string[]> = {
  couch: ['sofa'],
  sofa: ['sofa', 'armchair'],
  room: ['bed-double', 'door-open', 'house'],
  bedroom: ['bed-double', 'bed'],
  livingroom: ['sofa', 'armchair'],
  chair: ['armchair', 'rocking-chair'],
  kitchen: ['chef-hat', 'utensils-crossed', 'cooking-pot'],
  bathroom: ['bath', 'shower-head'],
  shower: ['shower-head'],
  tv: ['tv'],
  television: ['tv'],
  wifi: ['wifi'],
  internet: ['wifi'],
  ac: ['air-vent'],
  aircon: ['air-vent'],
  'air-conditioner': ['air-vent'],
  parking: ['circle-parking', 'car'],
  garage: ['warehouse', 'car'],
  pool: ['waves-horizontal'],
  swimming: ['waves-horizontal'],
  garden: ['flower', 'trees', 'sprout'],
  yard: ['trees', 'sprout'],
  elevator: ['move-vertical'],
  lift: ['move-vertical'],
  security: ['shield-check'],
  guard: ['shield-check'],
  balcony: ['door-open'],
  storage: ['archive', 'box'],
  laundry: ['washing-machine'],
  fridge: ['refrigerator'],
  refrigerator: ['refrigerator'],
  desk: ['lamp-desk'],
  light: ['lamp', 'lamp-ceiling'],
  lamp: ['lamp', 'lamp-floor', 'lamp-desk'],
};

export function getLucideIconEntryByKey(key: string | null | undefined): LucideIconEntry | null {
  if (!key) return null;
  const normalized = key.trim();
  if (!normalized) return null;
  return lucideEntryByKey.get(normalized) ?? lucideEntryByKey.get(lucideNameToKey(normalized)) ?? null;
}

export function getLucideIconByKey(key: string | null | undefined): LucideIcon | null {
  if (!key) return null;

  const normalized = key.trim();
  if (!normalized) return null;

  return (
    lucideIconByKey.get(normalized)
    ?? lucideIconByName.get(normalized)
    ?? lucideIconByKey.get(lucideNameToKey(normalized))
    ?? lucideIconByName.get(keyToLucideName(normalized))
    ?? null
  );
}

export function searchLucideIcons(query: string, limit = 120): LucideIconEntry[] {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return LUCIDE_ICON_ENTRIES.slice(0, 96);
  }

  const directMatches = LUCIDE_ICON_ENTRIES.filter((entry) => entry.searchText.includes(trimmed));

  const synonymEntries = (SEARCH_SYNONYMS[trimmed] ?? [])
    .map((key) => lucideEntryByKey.get(key))
    .filter((entry): entry is LucideIconEntry => Boolean(entry));

  const seen = new Set<string>();
  const combined: LucideIconEntry[] = [];
  for (const entry of [...synonymEntries, ...directMatches]) {
    if (!seen.has(entry.key)) {
      seen.add(entry.key);
      combined.push(entry);
    }
  }

  return combined.slice(0, limit);
}

export function formatIconKeyLabel(key: string): string {
  return key.replace(/-/g, ' ');
}
