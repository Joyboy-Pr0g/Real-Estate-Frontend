/** Paths disallowed in `app/robots.ts` — use `rel="nofollow"` on public nav links to reduce SF noise. */
const NOFOLLOW_INTERNAL_PREFIXES = [
  '/admin',
  '/dashboard',
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/api',
] as const;

export function shouldNofollowInternalHref(href: string): boolean {
  const path = href.split('?')[0]?.split('#')[0] ?? href;
  return NOFOLLOW_INTERNAL_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
