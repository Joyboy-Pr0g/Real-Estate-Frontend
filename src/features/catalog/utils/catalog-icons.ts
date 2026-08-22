import {
  Archive,
  Banknote,
  Bed,
  Box,
  Briefcase,
  Building,
  Building2,
  CalendarDays,
  Car,
  Dumbbell,
  Factory,
  FileText,
  Fuel,
  GraduationCap,
  Hammer,
  HeartPulse,
  Home,
  Hotel,
  KeyRound,
  Landmark,
  Layers,
  LayoutGrid,
  Map,
  Monitor,
  Package,
  Palmtree,
  ParkingCircle,
  Presentation,
  ShoppingBag,
  Sparkles,
  Sprout,
  Star,
  Store,
  Stethoscope,
  Umbrella,
  UtensilsCrossed,
  Warehouse,
  Waves,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  formatIconKeyLabel,
  getLucideIconByKey,
  keyToLucideName,
  lucideNameToKey,
} from '@/features/catalog/utils/lucide-icon-registry';

export const CATALOG_ICON_MAP: Record<string, LucideIcon> = {
  commercial: Store,
  land: Landmark,
  buildings: Building2,
  tourism: Hotel,
  special: Star,
  sale: Home,
  rent: KeyRound,
  assets: Package,
  lease: FileText,
  office: Briefcase,
  shop: Store,
  warehouse: Warehouse,
  showroom: Presentation,
  restaurant: UtensilsCrossed,
  clinic: Stethoscope,
  school: GraduationCap,
  gym: Dumbbell,
  bank: Banknote,
  mall: ShoppingBag,
  'service-center': Wrench,
  workshop: Factory,
  'bare-land': Map,
  'agricultural-land': Sprout,
  'industrial-land': Factory,
  'mixed-use-land': Layers,
  'residential-plot': Home,
  'commercial-plot': Store,
  'building-land': Hammer,
  'waterfront-land': Waves,
  'residential-building': Building,
  'commercial-building': Building2,
  'mixed-use-building': Layers,
  'office-building': Briefcase,
  'industrial-building': Factory,
  hotel: Hotel,
  resort: Palmtree,
  guesthouse: Home,
  hostel: Bed,
  'vacation-rental': CalendarDays,
  'boutique-hotel': Sparkles,
  'gas-station': Fuel,
  'parking-lot': ParkingCircle,
  'storage-unit': Archive,
  'parking-space': Car,
  kiosk: Box,
};

export const PROPERTY_TYPE_ICON_OPTIONS = [
  'commercial',
  'land',
  'buildings',
  'tourism',
  'special',
] as const;

export const TRANSACTION_TYPE_ICON_OPTIONS = ['sale', 'rent', 'assets', 'lease'] as const;

export const PROPERTY_SUBTYPE_ICON_OPTIONS = [
  'office',
  'shop',
  'warehouse',
  'showroom',
  'restaurant',
  'clinic',
  'school',
  'gym',
  'bank',
  'mall',
  'service-center',
  'workshop',
  'bare-land',
  'agricultural-land',
  'industrial-land',
  'mixed-use-land',
  'residential-plot',
  'commercial-plot',
  'building-land',
  'waterfront-land',
  'residential-building',
  'commercial-building',
  'mixed-use-building',
  'office-building',
  'industrial-building',
  'hotel',
  'resort',
  'guesthouse',
  'hostel',
  'vacation-rental',
  'boutique-hotel',
  'gas-station',
  'parking-lot',
  'storage-unit',
  'parking-space',
  'kiosk',
] as const;

export type PropertyTypeIconKey = (typeof PROPERTY_TYPE_ICON_OPTIONS)[number];
export type TransactionTypeIconKey = (typeof TRANSACTION_TYPE_ICON_OPTIONS)[number];
export type PropertySubtypeIconKey = (typeof PROPERTY_SUBTYPE_ICON_OPTIONS)[number];

export function getCatalogIcon(icon: string | null | undefined): LucideIcon {
  if (!icon) return Building2;
  if (CATALOG_ICON_MAP[icon]) return CATALOG_ICON_MAP[icon];

  const lucideIcon = getLucideIconByKey(icon);
  if (lucideIcon) return lucideIcon;

  return Building2;
}

export function formatIconLabel(icon: string): string {
  return formatIconKeyLabel(icon);
}

export function iconKeyFromLucideName(lucideName: string): string {
  return lucideNameToKey(lucideName);
}

export function lucideNameFromIconKey(key: string): string {
  return keyToLucideName(key);
}

export function getPropertyTypeIcon(icon: string | null): LucideIcon {
  return getCatalogIcon(icon);
}

export function getTransactionTypeIcon(icon: string): LucideIcon {
  return getCatalogIcon(icon);
}

export function getAllCategoryIcon(): LucideIcon {
  return LayoutGrid;
}

const TRANSACTION_EN: Record<string, string> = {
  for_sale: 'For sale',
  for_rent: 'For rent',
  with_assets: 'With assets',
  lease_takeover: 'Lease takeover',
};

export function getTransactionLabel(
  item: { name: string; display_name_ar: string },
  locale: 'ar' | 'en',
): string {
  if (locale === 'ar') return item.display_name_ar;
  return TRANSACTION_EN[item.name] ?? item.name.replace(/_/g, ' ');
}
