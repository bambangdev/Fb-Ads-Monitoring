
import React, { useMemo } from 'react';
import { AdAccount, CampaignStatus, CampaignStats, AccountStats, AdAccountStatus } from '../types';
import { 
    ArchiveBoxIcon, 
    PlayCircleIcon, 
    PauseCircleIcon, 
    XCircleIcon,
    BriefcaseIcon,
    UserIcon,
    DisabledIcon,
    HighRejectionIcon
} from './icons';

interface StatsSummaryProps {
    accounts: AdAccount[];
}

interface StatCardProps {
    icon: React.ReactNode;
    value: number;
    label: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-5">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-slate-800">{value.toLocaleString('id-ID')}</p>
            <p className="text-sm font-medium text-slate-500">{label}</p>
        </div>
    </div>
);

export const StatsSummary: React.FC<StatsSummaryProps> = ({ accounts }) => {
    const accountStats = useMemo<AccountStats>(() => {
        if (!accounts || accounts.length === 0) {
            return { total: 0, active: 0, inactive: 0, withRejections: 0 };
        }
        return {
            total: accounts.length,
            active: accounts.filter(acc => acc.status === AdAccountStatus.ACTIVE).length,
            inactive: accounts.filter(acc => acc.status === AdAccountStatus.DISABLED || acc.status === AdAccountStatus.CLOSED).length,
            withRejections: accounts.filter(acc => acc.rejectedAds.length > 0).length,
        };
    }, [accounts]);

    const campaignStats = useMemo<CampaignStats>(() => {
        if (!accounts || accounts.length === 0) {
            return { total: 0, active: 0, paused: 0, disapproved: 0 };
        }
        
        const allCampaigns = accounts.flatMap(acc => acc.campaigns);

        return {
            total: allCampaigns.length,
            active: allCampaigns.filter(c => c.status === CampaignStatus.ACTIVE).length,
            paused: allCampaigns.filter(c => c.status === CampaignStatus.PAUSED).length,
            disapproved: allCampaigns.filter(c => c.status === CampaignStatus.DISAPPROVED).length,
        };
    }, [accounts]);

    return (
        <div className="mb-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard 
                    icon={<BriefcaseIcon className="w-7 h-7 text-slate-600"/>}
                    value={accountStats.total}
                    label="Total Akun"
                    color="bg-slate-100"
                />
                <StatCard 
                    icon={<UserIcon className="w-7 h-7 text-green-600"/>}
                    value={accountStats.active}
                    label="Akun Aktif"
                    color="bg-green-100"
                />
                <StatCard 
                    icon={<DisabledIcon className="w-7 h-7 text-slate-600"/>}
                    value={accountStats.inactive}
                    label="Akun Nonaktif"
                    color="bg-slate-100"
                />
                <StatCard 
                    icon={<HighRejectionIcon className="w-7 h-7 text-orange-600"/>}
                    value={accountStats.withRejections}
                    label="Dengan Penolakan"
                    color="bg-orange-100"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard 
                    icon={<ArchiveBoxIcon className="w-7 h-7 text-slate-600"/>}
                    value={campaignStats.total}
                    label="Total Kampanye"
                    color="bg-slate-100"
                />
                <StatCard 
                    icon={<PlayCircleIcon className="w-7 h-7 text-green-600"/>}
                    value={campaignStats.active}
                    label="Kampanye Aktif"
                    color="bg-green-100"
                />
                <StatCard 
                    icon={<PauseCircleIcon className="w-7 h-7 text-yellow-600"/>}
                    value={campaignStats.paused}
                    label="Kampanye Dijeda"
                    color="bg-yellow-100"
                />
                <StatCard 
                    icon={<XCircleIcon className="w-7 h-7 text-red-600"/>}
                    value={campaignStats.disapproved}
                    label="Kampanye Bermasalah"
                    color="bg-red-100"
                />
            </div>
        </div>
    );
};