import { buildListingsUrl } from '@/features/listings/lib/build-listings-url';

export const FOOTER_MOCK = {
  brand: {
    primary: 'عقارات',
    secondary: 'اليمن',
  },
  description: {
    ar: 'منصة عقارية يمنية تجمع آلاف العقارات من مكاتب موثّقة. ابحث، قارن، وتواصل مباشرة مع الوكلاء في كل المدن.',
    en: 'A Yemeni marketplace connecting thousands of listings from verified offices. Search, compare, and reach agents in every city.',
  },
  phone: '+967 777 000 000',
  email: 'info@yemen-land.com',
  social: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    whatsapp: 'https://wa.me/967777000000',
    tiktok: 'https://tiktok.com',
  },
  cities: [
    { href: buildListingsUrl({ cityPcode: 'YE1101' }), labelKey: 'footer.citySanaa' as const },
    { href: buildListingsUrl({ cityPcode: 'YE2301' }), labelKey: 'footer.cityAden' as const },
    { href: buildListingsUrl({ cityPcode: 'YE1301' }), labelKey: 'footer.cityTaiz' as const },
    { href: buildListingsUrl({ cityPcode: 'YE2101' }), labelKey: 'footer.cityHodeidah' as const },
  ],
} as const;

export const FOOTER_LINKS = {
  browse: [
    { href: buildListingsUrl(), labelKey: 'footer.allListings' as const },
    { href: buildListingsUrl({ transactionTypeSlug: 'for-sale' }), labelKey: 'category.sale' as const },
    { href: buildListingsUrl({ transactionTypeSlug: 'for-rent' }), labelKey: 'category.rent' as const },
    { href: buildListingsUrl({ propertyTypeSlug: 'land' }), labelKey: 'category.land' as const },
    { href: '/offices', labelKey: 'nav.offices' as const },
  ],
  company: [
    { href: '/about', labelKey: 'footer.about' as const },
    { href: '/contact', labelKey: 'footer.contact' as const },
    { href: '/privacy', labelKey: 'footer.privacy' as const },
    { href: '/terms', labelKey: 'footer.terms' as const },
    { href: '/cookies', labelKey: 'footer.cookies' as const },
    { href: '/messaging-policy', labelKey: 'footer.messagingPolicy' as const },
    { href: '/listing-policy', labelKey: 'footer.listingPolicy' as const },
    { href: '/data-protection', labelKey: 'footer.dataProtection' as const },
    { href: '/verification', labelKey: 'footer.verification' as const },
  ],
  account: [
    { href: '/login', labelKey: 'footer.signIn' as const },
    { href: '/register', labelKey: 'footer.register' as const },
    { href: '/login', labelKey: 'footer.myAccount' as const },
    { href: '/host', labelKey: 'nav.host' as const },
  ],
} as const;

export const FOOTER_SECTION_KEYS = {
  browse: 'footer.browse',
  cities: 'footer.cities',
  company: 'footer.company',
  account: 'footer.account',
} as const;
