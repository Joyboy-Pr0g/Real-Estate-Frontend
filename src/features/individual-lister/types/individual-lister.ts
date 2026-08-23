export type IndividualListerVerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface IndividualListerProfile {
  id: string;
  user_id: string;
  id_photo_url: string;
  verification_status: IndividualListerVerificationStatus;
  verified_at: string | null;
  rejected_reason: string | null;
  rejected_at: string | null;
  created_at: string;
  deleted_at?: string | null;
  user?: {
    f_name: string;
    l_name: string;
    email: string;
    phone_number: string;
  };
}

export interface AdminIndividualListersFilters {
  id?: string;
  verificationStatus?: IndividualListerVerificationStatus;
  search?: string;
  include_deleted?: boolean;
  cursor?: string;
  limit?: number;
}

export interface AdminIndividualListersPage {
  items: IndividualListerProfile[];
  next_cursor: string | null;
  has_more: boolean;
}
