export const CACHE = {
  none: 0,
  short: 60,
  medium: 300,
  long: 3600,
  static: 86400,
} as const;

export type CacheProfile = keyof typeof CACHE;

export function isCacheableProfile(profile?: CacheProfile): boolean {
  return profile !== undefined && profile !== 'none' && CACHE[profile] > 0;
}
