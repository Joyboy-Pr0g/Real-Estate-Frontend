const INTERNAL_ORIGIN = 'http://internal.invalid';
const WHATSAPP_HOSTS = new Set(['wa.me', 'api.whatsapp.com']);

/**
 * Accepts only same-site paths from query parameters such as ?redirect= and ?backUrl=.
 * Absolute URLs, protocol-relative URLs ("//host") and the backslash / control-character
 * variants that browsers normalise into them are rejected, so login cannot become an open redirect.
 */
export function getSafeRedirectPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/')) return null;

  try {
    const url = new URL(value, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/** Accepts only https WhatsApp links (the backend builds https://wa.me/... verification links). */
export function getSafeWhatsAppLink(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && WHATSAPP_HOSTS.has(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}
