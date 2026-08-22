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

  const matches = LUCIDE_ICON_ENTRIES.filter((entry) => entry.searchText.includes(trimmed));
  return matches.slice(0, limit);
}

export function formatIconKeyLabel(key: string): string {
  return key.replace(/-/g, ' ');
}
