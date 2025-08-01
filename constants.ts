
import { AdAccount, AdAccountStatus, CampaignStatus } from './types';

export const MOCK_AD_ACCOUNTS: AdAccount[] = [
    {
        id: 'acc_001',
        name: 'Akun Iklan Fashion Wanita',
        businessManager: 'BM Utama',
        businessId: 'bm_123456789012345',
        status: AdAccountStatus.DISABLED,
        campaigns: [
            { id: 'camp_01_01', name: 'Promo Lebaran', status: CampaignStatus.PAUSED },
            { id: 'camp_01_02', name: 'Diskon Musim Panas', status: CampaignStatus.PAUSED },
            { id: 'camp_01_03', name: 'Koleksi Baru', status: CampaignStatus.DISAPPROVED },
        ],
        rejectedAds: [
            {
                id: 'ad_01',
                name: 'Diskon Kilat Gaun Musim Panas',
                rejectionDate: '2025-07-28T10:00:00Z',
                reason: 'Klaim yang berlebihan atau menyesatkan',
                adCopy: 'DISKON 90% SEMUA GAUN! Penawaran terbaik yang pernah ada, dijamin! Beli sekarang sebelum kehabisan!',
                adCreativeUrl: 'https://picsum.photos/seed/fashion1/400/400',
                adCreativeDescription: 'Gambar seorang model wanita mengenakan gaun berwarna cerah dengan teks besar "DISKON 90%" di atasnya.',
                campaignId: 'camp_01_01',
                adsetId: 'adset_01_01_01'
            },
            {
                id: 'ad_02',
                name: 'Sepatu Lari Revolusioner',
                rejectionDate: '2025-07-27T11:00:00Z',
                reason: 'Atribut pribadi',
                adCopy: 'Merasa kelebihan berat badan? Sepatu lari kami akan membantu Anda menurunkan berat badan dalam seminggu!',
                adCreativeUrl: 'https://picsum.photos/seed/shoes1/400/400',
                adCreativeDescription: 'Gambar sebelum dan sesudah yang menunjukkan penurunan berat badan yang drastis. Seseorang yang terlihat tidak bahagia di sebelah kiri, dan orang yang sama terlihat bugar dan bahagia di sebelah kanan sambil mengenakan sepatu kets.',
                campaignId: 'camp_01_01',
                adsetId: 'adset_01_01_02'
            },
            { 
                id: 'ad_03', 
                name: 'Tas Tangan Mewah Terjangkau', 
                rejectionDate: '2025-07-26T12:00:00Z', 
                reason: 'Pelanggaran Merek Dagang', 
                adCopy: 'Dapatkan tampilan Gucci tanpa harga Gucci! Tas tangan kami terinspirasi oleh desainer.', 
                adCreativeUrl: 'https://picsum.photos/seed/bag1/400/400', 
                adCreativeDescription: 'Gambar tas tangan yang sangat mirip dengan desain Gucci yang terkenal.',
                campaignId: 'camp_01_02',
                adsetId: 'adset_01_02_01'
            },
            { 
                id: 'ad_04', 
                name: 'Promo Kemeja Pria', 
                rejectionDate: '2025-07-25T13:00:00Z', 
                reason: 'Klaim yang menyesatkan', 
                adCopy: 'Kemeja terbaik di dunia! Dijamin membuat Anda terlihat 10 tahun lebih muda.', 
                adCreativeUrl: 'https://picsum.photos/seed/shirt1/400/400', 
                adCreativeDescription: 'Seorang pria yang sangat tampan mengenakan kemeja.',
                campaignId: 'camp_01_02',
                adsetId: 'adset_01_02_02'
            },
            { 
                id: 'ad_05', 
                name: 'Celana Jeans Edisi Terbatas', 
                rejectionDate: '2025-07-24T14:00:00Z', 
                reason: 'Kelangkaan Palsu', 
                adCopy: 'Hanya tersisa 5 buah! Beli sekarang atau Anda akan menyesal!', 
                adCreativeUrl: 'https://picsum.photos/seed/jeans1/400/400', 
                adCreativeDescription: 'Gambar celana jeans dengan stempel "HAMPIR HABIS".',
                campaignId: 'camp_01_03',
                adsetId: 'adset_01_03_01'
            },
            { 
                id: 'ad_06', 
                name: 'Jam Tangan Elegan', 
                rejectionDate: '2025-07-23T15:00:00Z', 
                reason: 'Produk/Layanan yang Dilarang', 
                adCopy: 'Jam tangan replika Rolex kualitas terbaik. Tidak ada yang bisa membedakannya.', 
                adCreativeUrl: 'https://picsum.photos/seed/watch1/400/400', 
                adCreativeDescription: 'Gambar close-up jam tangan yang terlihat sangat mirip dengan Rolex Submariner.',
                campaignId: 'camp_01_03',
                adsetId: 'adset_01_03_02'
            },
            { 
                id: 'ad_07', 
                name: 'Bikini Musim Panas', 
                rejectionDate: '2025-07-22T16:00:00Z', 
                reason: 'Konten Dewasa', 
                adCopy: 'Tampil seksi di pantai musim panas ini dengan koleksi bikini terbaru kami!', 
                adCreativeUrl: 'https://picsum.photos/seed/bikini1/400/400', 
                adCreativeDescription: 'Seorang model dalam pose provokatif mengenakan bikini minim.',
                campaignId: 'camp_01_03',
                adsetId: 'adset_01_03_03'
            },
            { 
                id: 'ad_08', 
                name: 'Obat Diet Ajaib', 
                rejectionDate: '2025-07-21T17:00:00Z', 
                reason: 'Kesehatan Pribadi', 
                adCopy: 'Turunkan 10kg dalam 10 hari dengan suplemen diet baru kami. Tanpa perlu olahraga!', 
                adCreativeUrl: 'https://picsum.photos/seed/diet1/400/400', 
                adCreativeDescription: 'Pita pengukur di sekitar pinggang yang sangat ramping.',
                campaignId: 'camp_01_03',
                adsetId: 'adset_01_03_04'
            },
        ],
    },
    {
        id: 'acc_002',
        name: 'Akun Iklan Properti',
        businessManager: 'BM Klien A',
        businessId: 'bm_987654321098765',
        status: AdAccountStatus.ACTIVE,
        campaigns: [
            { id: 'camp_02_01', name: 'Jual Cepat Apartemen', status: CampaignStatus.ACTIVE },
            { id: 'camp_02_02', name: 'Sewa Rumah Keluarga', status: CampaignStatus.PAUSED },
            { id: 'camp_02_03', name: 'Open House Cluster Baru', status: CampaignStatus.ACTIVE },
        ],
        rejectedAds: [
            {
                id: 'ad_11',
                name: 'Apartemen Mewah Pusat Kota',
                rejectionDate: '2025-07-27T09:00:00Z',
                reason: 'Praktik Diskriminatif',
                adCopy: 'Mencari penyewa profesional muda, lajang, tanpa anak untuk apartemen mewah kami.',
                adCreativeUrl: 'https://picsum.photos/seed/property1/400/400',
                adCreativeDescription: 'Gambar interior apartemen modern yang ramping.',
                campaignId: 'camp_02_01',
                adsetId: 'adset_02_01_01'
            },
            {
                id: 'ad_12',
                name: 'Peluang Investasi Real Estat',
                rejectionDate: '2025-07-26T08:00:00Z',
                reason: 'Layanan Keuangan yang Dilarang',
                adCopy: 'Gandakan uang Anda dalam setahun! Investasikan di properti kami dengan jaminan keuntungan 100%.',
                adCreativeUrl: 'https://picsum.photos/seed/property2/400/400',
                adCreativeDescription: 'Grafik yang menunjukkan panah naik tajam dengan tumpukan koin emas.',
                campaignId: 'camp_02_02',
                adsetId: 'adset_02_02_01'
            },
            {
                id: 'ad_13',
                name: 'Rumah Impian Keluarga Anda',
                rejectionDate: '2025-07-25T07:00:00Z',
                reason: 'Praktik Diskriminatif',
                adCopy: 'Rumah sempurna di lingkungan Kristen yang hebat, ideal untuk keluarga tradisional.',
                adCreativeUrl: 'https://picsum.photos/seed/property3/400/400',
                adCreativeDescription: 'Sebuah rumah pinggiran kota dengan halaman depan yang terawat baik.',
                campaignId: 'camp_02_03',
                adsetId: 'adset_02_03_01'
            },
        ],
    },
    {
        id: 'acc_003',
        name: 'Akun Iklan F&B',
        businessManager: 'BM Utama',
        businessId: 'bm_123456789012345',
        status: AdAccountStatus.ACTIVE,
        campaigns: [
            { id: 'camp_03_01', name: 'Promo Makan Siang', status: CampaignStatus.ACTIVE },
            { id: 'camp_03_02', name: 'Menu Baru Kopi', status: CampaignStatus.ACTIVE },
        ],
        rejectedAds: [],
    },
    {
        id: 'acc_004',
        name: 'Akun Iklan Gadget',
        businessManager: 'BM Cadangan',
        businessId: 'bm_112233445566778',
        status: AdAccountStatus.ACTIVE,
        campaigns: [
            { id: 'camp_04_01', name: 'Giveaway Smartphone', status: CampaignStatus.DISAPPROVED },
        ],
        rejectedAds: [
            {
                id: 'ad_21',
                name: 'Giveaway iPhone Gratis',
                rejectionDate: '2025-07-28T06:00:00Z',
                reason: 'Konten yang Dilarang: Skema Cepat Kaya',
                adCopy: 'Klik di sini dan ikuti survei kami untuk kesempatan memenangkan iPhone 15 baru! 100% gratis!',
                adCreativeUrl: 'https://picsum.photos/seed/gadget1/400/400',
                adCreativeDescription: 'Gambar tumpukan kotak iPhone dengan teks "GIVEAWAY GRATIS".',
                campaignId: 'camp_04_01',
                adsetId: 'adset_04_01_01'
            }
        ],
    },
];
