export interface AdminMainFeature {
  id: string;
  name: string;
  icon: string;
  slug: string;
  order: number;
  created_at: string;
  updated_at: string;
  sub_features?: { id: string }[];
}

export interface AdminSubFeature {
  id: string;
  main_feature_id: string;
  name: string;
  icon: string;
  slug: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface MainFeaturePayload {
  name: string;
  icon: string;
  order: number;
}

export type MainFeatureUpdatePayload = Partial<MainFeaturePayload>;

export interface SubFeaturePayload {
  name: string;
  icon: string;
  order: number;
  main_feature_id: string;
}

export type SubFeatureUpdatePayload = Partial<SubFeaturePayload>;

export interface SubFeaturesSearchParams {
  main_feature_id?: string;
}
