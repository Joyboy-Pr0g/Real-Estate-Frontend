import type { YerVariant } from '@/features/listings/types/listing';

export type ListingRentSourceKind = 'office' | 'market' | 'history';

export interface ListingRentSource {
  source: ListingRentSourceKind;
  available: boolean;
  value: string | null;
  sample_count?: number;
  recorded_at?: string | null;
}

export interface ListingInstallmentDefaults {
  min_down_pct: number;
  default_years: number;
  max_years: number;
}

export interface ListingMetricsResponse {
  eligible: boolean;
  price: string;
  yer_variant: YerVariant;
  accepts_installment: boolean;
  installment_defaults: ListingInstallmentDefaults;
  rent_sources: {
    office: ListingRentSource;
    market: ListingRentSource;
    history: ListingRentSource;
  };
  final_estimated_rent: string | null;
  has_sufficient_rent_data: boolean;
}
