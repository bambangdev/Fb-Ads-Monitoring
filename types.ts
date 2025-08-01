
export type FilterOption = 'all' | 'problematic' | 'disabled' | 'with-rejections';
export type SortOption = 'priority' | 'name' | 'rejections';

export enum RejectionLevel {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low', // Not used in UI but good for completeness
  None = 'None',
}

export enum AdAccountStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  UNSETTLED = 'UNSETTLED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PENDING_SETTLEMENT = 'PENDING_SETTLEMENT',
  IN_GRACE_PERIOD = 'IN_GRACE_PERIOD',
  PENDING_CLOSURE = 'PENDING_CLOSURE',
  CLOSED = 'CLOSED',
  UNKNOWN = 'UNKNOWN',
}

export enum CampaignStatus {
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    ARCHIVED = 'ARCHIVED',
    DELETED = 'DELETED',
    DISAPPROVED = 'DISAPPROVED',
    UNKNOWN = 'UNKNOWN',
}

export interface Campaign {
    id: string;
    name: string;
    status: CampaignStatus;
}

export interface RejectedAd {
  id: string;
  name: string;
  rejectionDate: string;
  reason: string;
  adCopy: string;
  adCreativeUrl: string;
  adCreativeDescription: string;
  creativeType?: string;
  videoUrl?: string;
  permalinkUrl?: string;
  postUrl?: string;
  campaignId: string;
  adsetId: string;
}

export interface AdAccount {
  id: string;
  name: string;
  businessManager: string;
  businessId: string;
  rejectedAds: RejectedAd[];
  status: AdAccountStatus;
  campaigns: Campaign[];
}

// Renamed from Stats to be more specific
export interface CampaignStats {
    total: number;
    active: number;
    paused: number;
    disapproved: number;
}

// Added for the new account summary cards
export interface AccountStats {
    total: number;
    active: number;
    inactive: number;
    withRejections: number;
}

// Types for structured AI analysis
export interface AdAnalysisViolation {
    kebijakan: string;
    kutipanBermasalah: string;
    penjelasan: string;
    saranPerbaikan: string;
    contohPerbaikan: string;
}

export interface AdAnalysisRecommendation {
    area: string;
    saran: string;
}

export interface AdAnalysisResult {
    analisisJudul: string;
    ringkasanMasalah: string;
    detailPelanggaran: AdAnalysisViolation[];
    rekomendasi: AdAnalysisRecommendation[];
}