import {
  Bath,
  Bed,
  Building2,
  Calendar,
  Car,
  DoorOpen,
  Home,
  Info,
  Layers,
  MoveVertical,
  ParkingCircle,
  Ruler,
  Sofa,
  Sparkles,
  Square,
  type LucideIcon,
} from 'lucide-react';

const SPEC_ICON_MAP: Record<string, LucideIcon> = {
  area_sqm: Ruler,
  area_sqm_gross: Ruler,
  area_sqm_net: Ruler,
  net_area_sqm: Ruler,
  total_office_space: Ruler,
  floor_number: Layers,
  number_of_floors: Building2,
  floors_count: Building2,
  rooms_count: DoorOpen,
  number_of_rooms: DoorOpen,
  bedrooms_count: Bed,
  bathrooms_count: Bath,
  number_of_bathrooms: Bath,
  has_elevator: MoveVertical,
  elevator: MoveVertical,
  parking_spaces: ParkingCircle,
  parking_area: ParkingCircle,
  parking: Car,
  furnished: Sofa,
  finishing_type: Sparkles,
  year_built: Calendar,
  building_age: Calendar,
  age_of_building: Calendar,
  usage_type: Home,
  usage_status: Home,
  land_area_sqm: Square,
  kitchen: Home,
  balcony: Home,
  heating: Sparkles,
  maintenance_fee: Info,
  deposit_tl: Info,
  within_a_building_complex: Building2,
  apartment_complex_name: Building2,
};

export function getSpecIcon(key: string): LucideIcon {
  if (SPEC_ICON_MAP[key]) return SPEC_ICON_MAP[key];

  const normalized = key.toLowerCase();
  if (normalized.includes('area') || normalized.includes('space')) return Ruler;
  if (normalized.includes('bedroom')) return Bed;
  if (normalized.includes('bathroom')) return Bath;
  if (normalized.includes('floor')) return Layers;
  if (normalized.includes('elevator')) return MoveVertical;
  if (normalized.includes('park')) return ParkingCircle;
  if (normalized.includes('furnish')) return Sofa;
  if (normalized.includes('room')) return DoorOpen;

  return Info;
}
