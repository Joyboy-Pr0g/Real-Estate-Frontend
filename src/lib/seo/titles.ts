const DEFAULT_MAX_TITLE_CHARS = 60;

/** Truncates on a word boundary when possible (Latin/Arabic whitespace). */
export function truncateSeoText(text: string, maxChars: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;

  const slice = normalized.slice(0, maxChars - 1).trimEnd();
  const lastSpace = Math.max(slice.lastIndexOf(' '), slice.lastIndexOf('\u00a0'));
  const trimmed = lastSpace > maxChars * 0.5 ? slice.slice(0, lastSpace).trimEnd() : slice;
  return `${trimmed}…`;
}

/** Full document `<title>` with brand suffix, capped for SERP display (~60 chars). */
export function buildAbsoluteDocumentTitle(
  pageTitle: string,
  siteName: string,
  maxTotalChars: number = DEFAULT_MAX_TITLE_CHARS,
): string {
  const brand = siteName.replace(/\s+/g, ' ').trim();
  const suffix = brand ? ` | ${brand}` : '';
  const maxPageLen = Math.max(16, maxTotalChars - suffix.length);
  const page = truncateSeoText(pageTitle, maxPageLen);
  const combined = `${page}${suffix}`;
  if (combined.length <= maxTotalChars) return combined;
  return truncateSeoText(combined, maxTotalChars);
}
