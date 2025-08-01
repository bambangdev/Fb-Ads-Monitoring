
import { AdAccount, RejectedAd, AdAccountStatus, Campaign, CampaignStatus } from '../types';

// Tipe data mentah dari Facebook Graph API untuk keamanan tipe
interface MetaAdAccount {
    id: string;
    name:string;
    account_status: number;
    business?: {
        id: string;
        name: string;
    };
}

interface MetaCampaign {
    id: string;
    name: string;
    status: CampaignStatus;
}

interface MetaAdCreative {
    name: string;
    body: string;
    image_url: string;
    thumbnail_url?: string;
    object_type?: string;
    video_id?: string;
}

interface MetaRejectedAd {
    id: string;
    name: string;
    created_time: string;
    effective_status: string;
    ad_review_feedback?: {
        global_reason: string;
    };
    adcreatives?: {
        data: MetaAdCreative[];
    };
    creative?: {
        effective_object_story_id?: string;
    };
    permalink_url?: string;
    campaign_id: string;
    adset_id: string;
}

const GRAPH_API_VERSION = 'v19.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

const mapAccountStatus = (status: number): AdAccountStatus => {
    switch (status) {
        case 1: return AdAccountStatus.ACTIVE;
        case 2: return AdAccountStatus.DISABLED;
        case 3: return AdAccountStatus.UNSETTLED;
        case 7: return AdAccountStatus.PENDING_REVIEW;
        case 9: return AdAccountStatus.PENDING_SETTLEMENT;
        case 100: return AdAccountStatus.IN_GRACE_PERIOD;
        case 101: return AdAccountStatus.PENDING_CLOSURE;
        case 201: return AdAccountStatus.CLOSED;
        default: return AdAccountStatus.UNKNOWN;
    }
};

const mapCampaignStatus = (status: string): CampaignStatus => {
    const upperCaseStatus = status.toUpperCase();
    if (upperCaseStatus in CampaignStatus) {
        return upperCaseStatus as CampaignStatus;
    }
    return CampaignStatus.UNKNOWN;
};

/**
 * Parses an error response from the Graph API to create a detailed, human-readable error message.
 * @param response The raw Response object from a failed fetch call.
 * @param contextMessage A message describing the context of the operation (e.g., "fetching ad accounts").
 * @returns An Error object with a descriptive message.
 */
const handleErrorResponse = async (response: Response, contextMessage: string): Promise<Error> => {
    const defaultMessage = `${contextMessage} (Status: ${response.status} ${response.statusText})`;
    let errorMessage = defaultMessage;
    let errorDetailsForLogging = '';

    try {
        const responseText = await response.text();
        errorDetailsForLogging = responseText;

        const errorData = JSON.parse(responseText);

        if (errorData && errorData.error) {
            const fbError = errorData.error;
            let detailedMessage = fbError.error_user_title || '';
            if (fbError.error_user_msg) {
                detailedMessage += (detailedMessage ? ': ' : '') + fbError.error_user_msg;
            } else if (fbError.message) {
                detailedMessage += (detailedMessage ? ': ' : '') + fbError.message;
            }

            if (!detailedMessage) detailedMessage = 'Pesan error tidak tersedia dari API.';
            if (fbError.code) detailedMessage += ` (Code: ${fbError.code})`;
            if (fbError.error_subcode) detailedMessage += ` (Subcode: ${fbError.error_subcode})`;
            errorMessage = detailedMessage;
        } else {
            errorMessage = `${defaultMessage}. Respons tidak dalam format error yang diharapkan.`;
            errorDetailsForLogging = JSON.stringify(errorData, null, 2);
        }
    } catch (e) {
        errorMessage = `${defaultMessage}. Respons bukan JSON yang valid.`;
    }

    console.error(`Kesalahan API terdeteksi: ${errorMessage}\nKonteks: ${contextMessage}\nDetail Respons:`, errorDetailsForLogging.slice(0, 1000));
    return new Error(errorMessage);
};

/**
 * Mengambil semua akun iklan dan data terkait (iklan ditolak, kampanye) dari Meta Graph API.
 * @param accessToken Token akses Meta Graph API.
 * @returns Promise yang resolve dengan array objek AdAccount yang sudah diperkaya.
 * @throws Error jika terjadi kesalahan fatal.
 */
export const fetchAdAccounts = async (accessToken: string): Promise<AdAccount[]> => {
    console.log("Mulai mengambil data dari Meta Graph API...");

    try {
        console.log("Langkah 1: Mengambil semua akun iklan dengan paginasi...");
        const adAccountsFromApi: MetaAdAccount[] = [];

        const encodedToken = encodeURIComponent(accessToken);
        // Fetch the business ID along with the name.
        let nextUrl: string | undefined = `${BASE_URL}/me/adaccounts?fields=id,name,account_status,business{id,name}&limit=100&access_token=${encodedToken}`;
        
        while (nextUrl) {
            const adAccountsResponse = await fetch(nextUrl);
            if (!adAccountsResponse.ok) {
                throw await handleErrorResponse(adAccountsResponse, 'Gagal mengambil halaman akun iklan');
            }
            const adAccountsResult = await adAccountsResponse.json();
            if (adAccountsResult.data) {
                adAccountsFromApi.push(...adAccountsResult.data);
            }
            nextUrl = adAccountsResult.paging?.next;
            if(nextUrl) console.log("Mengambil halaman akun iklan berikutnya...");
        }

        if (adAccountsFromApi.length === 0) {
            console.log("Tidak ada akun iklan yang ditemukan untuk pengguna ini.");
            return [];
        }
        console.log(`Ditemukan total ${adAccountsFromApi.length} akun iklan.`);

        console.log("Langkah 2: Mengambil iklan yang ditolak dan kampanye untuk setiap akun...");
        
        const finalAdAccountsPromises = adAccountsFromApi.map(async (account) => {
            // Fetch rejected ads directly using Graph API filtering
            let rejectedAds: RejectedAd[] = [];
            try {
                const rejectedAdsFromApi: MetaRejectedAd[] = [];
                // API filter to get only ads with DISAPPROVED status. This is more efficient and reliable.
                const filtering = encodeURIComponent(JSON.stringify([{
                    field: 'effective_status',
                    operator: 'IN',
                    value: ['DISAPPROVED']
                }]));
                // We now fetch permalink_url and creative post ID to link directly to the ad post on Facebook.
                let adsNextUrl: string | undefined = `${BASE_URL}/${account.id}/ads?fields=name,created_time,effective_status,campaign_id,adset_id,permalink_url,creative{effective_object_story_id},adcreatives{name,body,image_url,thumbnail_url,object_type,video_id}&filtering=${filtering}&limit=100&access_token=${encodedToken}`;

                while(adsNextUrl) {
                    const adsResponse = await fetch(adsNextUrl);
                    if (adsResponse.ok) {
                        const adsResult = await adsResponse.json();
                        if (adsResult.data) {
                            rejectedAdsFromApi.push(...adsResult.data);
                        }
                        adsNextUrl = adsResult.paging?.next;
                    } else {
                        console.warn(`Gagal mengambil iklan ditolak untuk akun ${account.id}. Status: ${adsResponse.status}. Melanjutkan.`);
                        adsNextUrl = undefined;
                    }
                }

                // Since we filtered via API, we just need to map the results.
                rejectedAds = rejectedAdsFromApi
                    .sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime())
                    .map(ad => {
                        const creative = ad.adcreatives?.data?.[0];
                        // Prioritize thumbnail_url for video previews, fallback to image_url.
                        const creativeUrl = creative?.thumbnail_url || creative?.image_url || `https://via.placeholder.com/400?text=No+Preview`;
                        const videoUrl = creative?.video_id ? `https://www.facebook.com/${creative.video_id}` : undefined;
                        const postUrl = ad.creative?.effective_object_story_id ? `https://www.facebook.com/${ad.creative.effective_object_story_id}` : undefined;
                        
                        return {
                            id: ad.id,
                            name: ad.name,
                            rejectionDate: ad.created_time, // Store as ISO string for reliable parsing
                            reason: ad.ad_review_feedback?.global_reason || ad.effective_status, // Fallback to effective status
                            adCopy: creative?.body || 'Teks iklan tidak tersedia.',
                            adCreativeUrl: creativeUrl,
                            adCreativeDescription: `Creative for ad: ${creative?.name || ad.name}`,
                            creativeType: creative?.object_type?.toUpperCase(),
                            videoUrl: videoUrl,
                            permalinkUrl: ad.permalink_url,
                            postUrl: postUrl,
                            campaignId: ad.campaign_id,
                            adsetId: ad.adset_id,
                        };
                    });
            } catch (error: any) {
                console.error(`Terjadi error saat mengambil iklan ditolak untuk akun ${account.id}:`, error.message);
            }
            
            // Fetch campaigns
            const campaignsUrl = `${BASE_URL}/${account.id}/campaigns?fields=id,name,status&limit=500&access_token=${encodedToken}`;
            let campaigns: Campaign[] = [];
            try {
                const campaignsResponse = await fetch(campaignsUrl);
                if (campaignsResponse.ok) {
                    const campaignsResult = await campaignsResponse.json();
                    const campaignsFromApi: MetaCampaign[] = campaignsResult.data || [];
                    campaigns = campaignsFromApi.map(camp => ({
                        id: camp.id,
                        name: camp.name,
                        status: mapCampaignStatus(camp.status),
                    }));
                } else {
                    console.warn(`Gagal mengambil kampanye untuk akun ${account.id}. Status: ${campaignsResponse.status}.`);
                }
            } catch (error: any) {
                console.error(`Terjadi error saat mengambil kampanye untuk akun ${account.id}:`, error.message);
            }


            return {
                id: account.id,
                name: account.name,
                businessManager: account.business?.name || 'Personal Account',
                businessId: account.business?.id || '',
                rejectedAds: rejectedAds,
                status: mapAccountStatus(account.account_status),
                campaigns: campaigns,
            };
        });

        const finalData = await Promise.all(finalAdAccountsPromises);

        console.log(`Berhasil mengambil dan memproses data dari ${finalData.length} akun.`);
        return finalData;

    } catch (error: any) {
        console.error("Terjadi kesalahan fatal di fetchAdAccounts:", error.message || error);
        throw error; // Lempar kembali error untuk ditangani oleh UI
    }
};
