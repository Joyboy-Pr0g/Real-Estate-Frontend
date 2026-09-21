import type { Metadata } from 'next';

/** Static favicon assets served from `public/favicon/`. */
export const STATIC_FAVICON_PATHS = {
  ico: '/favicon/favicon.ico',
  svg: '/favicon/favicon.svg',
  png96: '/favicon/favicon-96x96.png',
  appleTouch: '/favicon/apple-touch-icon.png',
  pwa192: '/favicon/web-app-manifest-192x192.png',
  pwa512: '/favicon/web-app-manifest-512x512.png',
  manifest: '/favicon/site.webmanifest',
} as const;

export function resolveFaviconAssetUrl(siteUrl: string, path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = siteUrl.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildFaviconMetadata(
  siteUrl: string,
  customFaviconUrl?: string | null,
): Pick<Metadata, 'icons' | 'manifest'> {
  const custom = customFaviconUrl?.trim();

  if (custom) {
    const favicon = resolveFaviconAssetUrl(siteUrl, custom);
    return {
      icons: {
        icon: [{ url: favicon, sizes: 'any' }],
        apple: [{ url: favicon, sizes: '180x180' }],
        shortcut: [favicon],
      },
      manifest: STATIC_FAVICON_PATHS.manifest,
    };
  }

  return {
    icons: {
      icon: [
        { url: STATIC_FAVICON_PATHS.ico, sizes: '48x48' },
        { url: STATIC_FAVICON_PATHS.svg, type: 'image/svg+xml' },
        { url: STATIC_FAVICON_PATHS.png96, sizes: '96x96', type: 'image/png' },
      ],
      apple: [
        {
          url: STATIC_FAVICON_PATHS.appleTouch,
          sizes: '180x180',
          type: 'image/png',
        },
      ],
      shortcut: [STATIC_FAVICON_PATHS.ico],
    },
    manifest: STATIC_FAVICON_PATHS.manifest,
  };
}
