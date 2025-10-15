export interface AdminUserSummary {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export interface AdminPayout {
  id: string;
  stripe_payout_id: string;
  status: string;
  payout_type: string;
  amount: string;
  currency: string;
  created_at: string;
  seller_info: AdminUserSummary;
}

export interface PayoutSummary {
  total_amount: string;
  average_amount: string;
  total_fees: string;
  status_breakdown: Record<string, number>;
}

export interface PayoutsResponse {
  payouts: AdminPayout[];
  pagination: {
    total_count: number;
    offset: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
  summary: PayoutSummary;
}

export interface AdminTransactionAmounts {
  gross_amount: string;
  platform_fee: string;
  stripe_fee: string;
  net_amount: string;
  currency: string;
}

export interface AdminTransactionHoldInfo {
  status: string;
  hold_reason: string;
  days_to_hold: number;
  hold_start_date: string | null;
  planned_release_date: string | null;
  actual_release_date: string | null;
}

export interface AdminTransaction {
  id: string;
  order_id: string | null;
  stripe_payment_intent_id: string;
  status: string;
  seller: AdminUserSummary;
  buyer: AdminUserSummary | null;
  amounts: AdminTransactionAmounts;
  hold_info: AdminTransactionHoldInfo;
  payout_info: {
    payed_out: boolean;
  };
  timestamps: {
    created_at: string;
    updated_at: string;
    purchase_date: string | null;
  };
}

export interface TransactionsResponse {
  transactions: AdminTransaction[];
  pagination: {
    total_count: number;
    offset: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
  summary: {
    total_gross: string;
    total_net: string;
    total_platform_fees: string;
    total_stripe_fees: string;
    average_transaction: string;
    status_breakdown: Record<string, number>;
  };
}

export type SellerApplicationStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'revision_requested';

export interface SellerApplicationImage {
  id: number;
  image: string;
  image_type: string;
  description: string;
}

export interface SellerApplication {
  id: number;
  business_name: string;
  seller_type: string;
  motivation: string;
  portfolio_url: string;
  social_media_url?: string;
  status: SellerApplicationStatus;
  submitted_at: string;
  user_email: string;
  user_name: string;
  admin_notes?: string;
  rejection_reason?: string;
  approved_by_name?: string;
  rejected_by_name?: string;
  images: SellerApplicationImage[];
}
