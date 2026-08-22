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
  net_area_sqm: Ruler,
  total_office_space: Ruler,
  floor_number: Layers,
  floors_count: Building2,
  rooms_count: DoorOpen,
  bedrooms_count: Bed,
  bathrooms_count: Bath,
  has_elevator: MoveVertical,
  parking_spaces: ParkingCircle,
  parking: Car,
  furnished: Sofa,
  finishing_type: Sparkles,
  year_built: Calendar,
  building_age: Calendar,
  usage_type: Home,
  land_area_sqm: Square,
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
