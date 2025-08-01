
import React, { useState, useCallback, useMemo } from 'react';
import { AdAccount, RejectedAd, AdAccountStatus, AdAnalysisResult } from '../types';
import { CloseIcon, SparklesIcon, ExternalLinkIcon, FacebookIcon, ShieldAlertIcon, WandIcon, CheckCircleIcon, LightbulbIcon } from './icons';
import { analyzeAdRejection } from '../services/geminiService';

interface AdDetailModalProps {
    account: AdAccount;
    onClose: () => void;
    dateRange: [Date, Date];
}

const isAnalysisResult = (result: any): result is AdAnalysisResult => {
    return typeof result === 'object' && result !== null && 'analisisJudul' in result;
};

interface RejectedAdItemProps {
    ad: RejectedAd;
    accountId: string;
    businessId: string;
}

const RejectedAdItem: React.FC<RejectedAdItemProps> = ({ ad, accountId, businessId }) => {
    const [analysisState, setAnalysisState] = useState<{ isLoading: boolean, result: AdAnalysisResult | string | null }>({ isLoading: false, result: null });

    const handleAnalyze = useCallback(async () => {
        setAnalysisState({ isLoading: true, result: null });
        const analysisResult = await analyzeAdRejection(ad);
        setAnalysisState({ isLoading: false, result: analysisResult });
    }, [ad]);

    const isAnalyzeDisabled = analysisState.isLoading;

    const adsManagerViewUrl = useMemo(() => {
        const isBusinessAccount = !!businessId && businessId.trim() !== '';
        const baseUrl = isBusinessAccount
            ? 'https://business.facebook.com/adsmanager/manage/ads'
            : 'https://www.facebook.com/adsmanager/manage/ads';
        const numericAccountId = accountId.replace(/^act_/, '');
        const params = new URLSearchParams({
            act: numericAccountId,
            selected_campaign_ids: JSON.stringify([ad.campaignId]),
            selected_adset_ids: JSON.stringify([ad.adsetId]),
            selected_ad_ids: JSON.stringify([ad.id]),
        });
        if (isBusinessAccount) {
            params.append('business_id', businessId);
        }
        return `${baseUrl}?${params.toString()}`;
    }, [accountId, businessId, ad.campaignId, ad.adsetId, ad.id]);

    const adsManagerEditUrl = useMemo(() => {
        const baseUrl = 'https://adsmanager.facebook.com/adsmanager/manage/creation_package';
        const numericAccountId = accountId.replace(/^act_/, '');
        
        const params = new URLSearchParams({
            act: numericAccountId,
            selected_campaign_ids: ad.campaignId,
            selected_adset_ids: ad.adsetId,
            selected_ad_ids: ad.id,
            nav_source: 'no_referrer',
            current_step: '2',
            package_config_id: '368028505538585',
        });

        if (businessId && businessId.trim() !== '') {
            params.append('business_id', businessId);
        }

        return `${baseUrl}?${params.toString()}`;
    }, [accountId, businessId, ad.campaignId, ad.adsetId, ad.id]);

    const creativeLink = useMemo(() => {
        if (ad.permalinkUrl) return ad.permalinkUrl;
        if (ad.postUrl) return ad.postUrl;
        if (ad.creativeType === 'VIDEO' && ad.videoUrl) return ad.videoUrl;
        return adsManagerViewUrl;
    }, [ad.permalinkUrl, ad.postUrl, ad.videoUrl, ad.creativeType, adsManagerViewUrl]);

    const linksToFacebook = useMemo(() => creativeLink.includes('facebook.com'), [creativeLink]);

    const renderCreativePreview = () => {
        const isVideo = ad.creativeType === 'VIDEO';
        return (
            <a href={creativeLink} target="_blank" rel="noopener noreferrer" className="relative block w-full md:w-32 h-32 flex-shrink-0 group bg-slate-100 rounded-md">
                 <img 
                    src={ad.adCreativeUrl} 
                    alt={ad.name} 
                    className="w-full h-full object-cover rounded-md transition-opacity group-hover:opacity-75"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400?text=Preview+Error')}
                />
                {isVideo ? (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {linksToFacebook ? <FacebookIcon className="h-8 w-8 text-white" /> : <ExternalLinkIcon className="h-8 w-8 text-white" />}
                    </div>
                )}
            </a>
        );
    };

    return (
        <div className="p-4 border border-slate-200 rounded-lg">
            <div className="flex flex-col md:flex-row gap-4">
                {renderCreativePreview()}
                <div className="flex-grow">
                    <h4 className="font-semibold text-slate-800">{ad.name}</h4>
                    <p className="text-sm text-slate-500">Ditolak pada: {new Date(ad.rejectionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="text-sm text-red-600 font-medium mt-1">Alasan: {ad.reason}</p>
                    <p className="text-sm text-slate-600 mt-2 italic">"{ad.adCopy}"</p>
                </div>
                <div className="flex-shrink-0 mt-2 md:mt-0 flex flex-col gap-2">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzeDisabled}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        title="Analisis dengan AI"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        {analysisState.isLoading ? 'Menganalisis...' : 'Analisis dengan AI'}
                    </button>
                    <a href={adsManagerEditUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all" title="Edit iklan di Meta Ads Manager">
                        <ExternalLinkIcon className="w-5 h-5"/>
                        Edit di Ads Manager
                    </a>
                </div>
            </div>
            {analysisState.isLoading && (
                 <div className="mt-4 p-4 space-y-5 bg-slate-50/70 rounded-lg animate-pulse">
                    <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    </div>
                    <div className="pt-2">
                        <div className="h-4 bg-slate-300 rounded w-1/3 mb-3"></div>
                        <div className="p-3 border border-slate-200 rounded-lg space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-full"></div>
                        </div>
                    </div>
                 </div>
            )}
            {analysisState.result && (
                <div className="mt-4 p-5 bg-slate-50 rounded-lg border border-slate-200">
                    {isAnalysisResult(analysisState.result) ? (
                        <div className="space-y-6">
                            <div>
                                <h5 className="flex items-center gap-2 text-lg font-bold text-indigo-800">
                                    <WandIcon className="w-6 h-6"/>
                                    Analisis & Rekomendasi AI
                                </h5>
                                <p className="mt-1 text-slate-600">{analysisState.result.ringkasanMasalah}</p>
                            </div>
                            
                            <div className="space-y-4">
                                <h6 className="font-semibold text-slate-700">Detail Pelanggaran Kebijakan</h6>
                                {analysisState.result.detailPelanggaran.map((item, index) => (
                                    <div key={index} className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                                        <div className="flex items-start gap-3">
                                            <ShieldAlertIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-red-800">{item.kebijakan}</p>
                                                <blockquote className="mt-1 text-sm text-red-700 italic border-l-2 border-red-300 pl-2">
                                                    "{item.kutipanBermasalah}"
                                                </blockquote>
                                                <p className="mt-2 text-sm text-red-900">{item.penjelasan}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-red-200 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-green-800">Saran Perbaikan (Best Practice)</p>
                                                    <p className="mt-1 text-sm text-slate-700">{item.saranPerbaikan}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <LightbulbIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-blue-800">Contoh yang Bisa Digunakan</p>
                                                    <p className="mt-1 text-sm text-slate-700 italic">"{item.contohPerbaikan}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <h6 className="font-semibold text-slate-700">Rekomendasi Umum</h6>
                                <ul className="space-y-3">
                                    {analysisState.result.rekomendasi.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-slate-800">{item.area}</p>
                                                <p className="text-sm text-slate-600">{item.saran}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                         <div className={`p-4 border-l-4 rounded-r-lg bg-yellow-50 border-yellow-400`}>
                            <h5 className={`font-bold mb-2 text-yellow-800`}>Analisis Gagal</h5>
                            <div className={`prose prose-sm whitespace-pre-wrap text-yellow-900`}>
                                {analysisState.result}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export const AdDetailModal: React.FC<AdDetailModalProps> = ({ account, onClose, dateRange }) => {
    const isProblematicStatus = account.status === AdAccountStatus.DISABLED || account.status === AdAccountStatus.CLOSED;

    const filteredRejectedAds = useMemo(() => {
        if (!dateRange || dateRange.length < 2) {
            return account.rejectedAds;
        }
        
        const [startDate, endDate] = dateRange;
        const startOfDay = new Date(new Date(startDate).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        
        return account.rejectedAds.filter(ad => {
            const rejectionDate = new Date(ad.rejectionDate);
            return rejectionDate >= startOfDay && rejectionDate <= endOfDay;
        });

    }, [account.rejectedAds, dateRange]);

    const totalRejectedAds = account.rejectedAds.length;
    const isFiltered = filteredRejectedAds.length < totalRejectedAds;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 border-b border-slate-200">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Detail Akun Iklan</h3>
                        <p className="text-sm text-slate-500">{account.name} ({account.id})</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                        <CloseIcon />
                    </button>
                </header>
                <main className="p-5 overflow-y-auto space-y-4">
                    {isFiltered && (
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg text-blue-900">
                            <p className="font-semibold">Menampilkan Hasil yang Difilter</p>
                            <p className="text-sm mt-1">
                                Hanya <strong>{filteredRejectedAds.length} dari {totalRejectedAds}</strong> iklan ditolak yang ditampilkan sesuai rentang tanggal. Ubah filter untuk melihat semua.
                            </p>
                        </div>
                    )}
                    
                    {filteredRejectedAds.length > 0 ? (
                        filteredRejectedAds.map(ad => (
                            <RejectedAdItem key={ad.id} ad={ad} accountId={account.id} businessId={account.businessId} />
                        ))
                    ) : totalRejectedAds > 0 ? (
                        <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
                            <h4 className="text-lg font-semibold text-slate-700">Tidak Ada Iklan Ditolak di Rentang Ini</h4>
                            <p className="text-slate-500 mt-2">
                                Tidak ada iklan yang ditolak ditemukan dalam rentang tanggal yang dipilih. Coba perluas rentang tanggal Anda.
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
                            <h4 className="text-lg font-semibold text-slate-700">Informasi Akun</h4>
                            <p className="text-slate-500 mt-2">
                                Tidak ada iklan ditolak yang ditemukan untuk akun ini.
                            </p>
                            <div className="mt-4">
                                <span className="text-slate-500">Status Akun Saat Ini: </span>
                                <span className={`px-2.5 py-1 text-sm font-semibold rounded-full border capitalize ${
                                    isProblematicStatus 
                                        ? 'bg-red-100 text-red-800 border-red-200' 
                                        : 'bg-slate-100 text-slate-800 border-slate-200'
                                }`}>
                                    {account.status.replace(/_/g, ' ').toLowerCase()}
                                </span>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
