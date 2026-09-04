export type PublicOfficeVerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type PublicOfficeUserRole = 'office_admin' | 'office_agent' | 'office_manager';

export interface PublicOfficeSummary {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  city: string;
  neighborhood: string;
  address: string;
  office_photo_url: string;
  verification_status: PublicOfficeVerificationStatus;
}

export interface PublicOfficeMember {
  id: string;
  user_id: string;
  role: PublicOfficeUserRole;
  name: string;
  phone_number: string;
  email: string;
  user_image_url: string | null;
}

export interface PublicOfficeDetail extends PublicOfficeSummary {
  city_id: string;
  neighborhood_id: string;
  members: PublicOfficeMember[];
}

export interface PublicOfficesSearchParams {
  cityId?: string;
  neighborhoodId?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface PublicOfficesPage {
  items: PublicOfficeSummary[];
  next_cursor: string | null;
  has_more: boolean;
}
