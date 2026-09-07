import { revalidatePath, revalidateTag } from 'next/cache';
import { LEGAL_PAGE_PATHS } from '@/lib/seo/indexing';

function revalidateMarketplaceLayout() {
  revalidatePath('/', 'layout');
}

export function revalidateWebsiteSettingsMarketplace() {
  revalidateTag('website-settings', 'max');
  revalidateMarketplaceLayout();
  for (const path of LEGAL_PAGE_PATHS) {
    revalidatePath(path);
  }
  revalidatePath('/sitemap.xml');
  revalidatePath('/robots.txt');
}
