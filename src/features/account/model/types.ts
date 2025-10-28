export interface SellerApplicationRequest {
  businessName: string;
  sellerType: string;
  motivation: string;
  portfolio: string;
  socialMedia?: string;
  workshopPhotos: File[];
}

export interface SellerApplicationStatus {
  has_application: boolean;
  is_seller: boolean;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'revision_requested';
  application_id?: number;
  submitted_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
}

