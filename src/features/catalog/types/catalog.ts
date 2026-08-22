export interface PublicCity {
  id: string;
  name: string;
  governorate: string;
  pcode: string;
  city_photo_url: string;
}

export interface PublicPropertyType {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface PublicTransactionType {
  id: string;
  name: string;
  slug: string;
  display_name_ar: string;
  icon: string;
}

export interface PublicCatalog {
  cities: PublicCity[];
  propertyTypes: PublicPropertyType[];
  transactionTypes: PublicTransactionType[];
}
