export interface PublicSubFeature {
  id: string;
  main_feature_id: string;
  name: string;
  icon: string;
  slug: string;
  order: number;
}

export interface PublicMainFeature {
  id: string;
  name: string;
  icon: string;
  slug: string;
  order: number;
  sub_features: PublicSubFeature[];
}
