// services/metaService.ts

import {
  AdAccount,
  Campaign,
  MetaAdAccount,
  MetaCampaign,
  MetaRejectedAd,
  RejectedAd,
} from '../types/adAccount';

const FACEBOOK_GRAPH_API_URL = 'https://graph.facebook.com/v20.0';

// --- HELPER FUNCTIONS (Tidak ada perubahan di sini) ---
const mapAccountStatus = (status: number): string => {
  const statuses: { [key: number]: string } = {
    1: 'Active',
    2: 'Disabled',
    3: 'Unsettled',
    7: 'Pending Review',
    8: 'Pending Settlement',
    9: 'In Grace Period',
    100: 'Pending Closure',
    101: 'Closed',
    201: 'Any Active',
    202: 'Any Closed',
  };
  return statuses[status] || 'Unknown';
};

const fetchAllPages = async <T>(
  initialUrl: string,
  accessToken: string,
): Promise<T[]> => {
  let allData: T[] = [];
  let nextUrl: string | undefined = initialUrl;

  while (nextUrl) {
    const response = await fetch(`${nextUrl}&access_token=${accessToken}`);
    const json = await response.json();
    if (json.error) {
      console.error('Facebook API Error:', json.error);
      throw new Error(json.error.message);
    }
    allData = allData.concat(json.data);
    nextUrl = json.paging?.next;
  }
  return allData;
};

// --- FUNGSI UTAMA YANG DIMODIFIKASI ---

/**
 * [MODIFIKASI] Fungsi ini sekarang HANYA mengambil daftar akun iklan dasar.
 * Data detail seperti kampanye dan iklan ditolak tidak lagi diambil di sini.
 * Tujuannya agar pemuatan awal menjadi sangat cepat.
 */
export const fetchAdAccounts = async (
  accessToken: string,
): Promise<AdAccount[]> => {
  const url = `${FACEBOOK_GRAPH_API_URL}/me/adaccounts?fields=id,name,account_status,business&limit=100`;
  const adAccountsFromApi: MetaAdAccount[] = await fetchAllPages<MetaAdAccount>(
    url,
    accessToken,
  );

  const finalAdAccounts: AdAccount[] = adAccountsFromApi.map(account => ({
    id: account.id,
    name: account.name,
    businessManager: account.business?.name || 'Personal Account',
    businessId: account.business?.id || '',
    status: mapAccountStatus(account.account_status),
    // Data ini akan dikosongkan di awal dan diisi nanti (Lazy Loading)
    rejectedAds: [],
    campaigns: [],
  }));

  console.log(
    `Successfully fetched ${finalAdAccounts.length} ad accounts (basic info only).`,
  );
  return finalAdAccounts;
};

/**
 * [BARU] Fungsi ini mengambil detail untuk SATU akun iklan.
 * Dipanggil hanya ketika pengguna ingin melihat detail (misalnya, membuka modal).
 */
export const fetchAdAccountDetails = async (
  accountId: string,
  accessToken: string,
): Promise<{ rejectedAds: RejectedAd[]; campaigns: Campaign[] }> => {
  console.log(`Fetching details for account: ${accountId}`);

  // 1. Ambil Iklan yang Ditolak
  const rejectedAdsUrl = `${FACEBOOK_GRAPH_API_URL}/${accountId}/ads?fields=id,name,adset{name},creative{thumbnail_url},effective_status,issues_info&filtering=[{"field":"effective_status","operator":"IN","value":["ADSET_PAUSED","WITH_ISSUES","DISAPPROVED","PENDING_REVIEW"]}]&limit=50`;
  const metaRejectedAds: MetaRejectedAd[] = await fetchAllPages<MetaRejectedAd>(
    rejectedAdsUrl,
    accessToken,
  );
  const rejectedAds: RejectedAd[] = metaRejectedAds.map(ad => ({
    id: ad.id,
    name: ad.name,
    adset: ad.adset?.name || 'N/A',
    thumbnail: ad.creative?.thumbnail_url || '',
    status: ad.effective_status,
    issues: ad.issues_info?.map(issue => issue.error_summary).join(', ') || 'No issues info',
  }));

  // 2. Ambil Kampanye
  const campaignsUrl = `${FACEBOOK_GRAPH_API_URL}/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&limit=50`;
  const metaCampaigns: MetaCampaign[] = await fetchAllPages<MetaCampaign>(
    campaignsUrl,
    accessToken,
  );
  const campaigns: Campaign[] = metaCampaigns.map(c => ({
    id: c.id,
    name: c.name,
    status: c.status,
    objective: c.objective,
    budget: c.daily_budget
      ? `$${(parseInt(c.daily_budget) / 100).toFixed(2)}/day`
      : c.lifetime_budget
        ? `$${(parseInt(c.lifetime_budget) / 100).toFixed(2)} total`
        : 'N/A',
  }));

  return { rejectedAds, campaigns };
};