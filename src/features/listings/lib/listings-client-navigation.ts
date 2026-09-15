export const LISTINGS_SEARCH_PARAMS_EVENT = 'listings-search-params';

export function normalizeSearchQueryKey(input: string | URLSearchParams): string {
  const params =
    typeof input === 'string'
      ? new URLSearchParams(input.startsWith('?') ? input.slice(1) : input)
      : input;
  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  return new URLSearchParams(entries).toString();
}

export function readListingsSearchQueryKey(): string {
  if (typeof window === 'undefined') return '';
  return normalizeSearchQueryKey(window.location.search);
}

export function applyListingsClientNavigation(href: string, mode: 'push' | 'replace' = 'push') {
  const url = new URL(href, window.location.origin);
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) return;

  if (mode === 'replace') {
    window.history.replaceState(window.history.state, '', next);
  } else {
    window.history.pushState(window.history.state, '', next);
  }

  window.dispatchEvent(new Event(LISTINGS_SEARCH_PARAMS_EVENT));
}

export function subscribeListingsSearchParams(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener('popstate', handler);
  window.addEventListener(LISTINGS_SEARCH_PARAMS_EVENT, handler);
  return () => {
    window.removeEventListener('popstate', handler);
    window.removeEventListener(LISTINGS_SEARCH_PARAMS_EVENT, handler);
  };
}
