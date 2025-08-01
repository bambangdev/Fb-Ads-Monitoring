import React, { useState, useMemo } from 'react';
import { AdAccount, AdAccountStatus } from '../types';
import { AdAccountCard } from './AdAccountCard';
import { BriefcaseIcon, ChevronDownIcon } from './icons';

interface BusinessManagerCardProps {
    bmName: string;
    accounts: AdAccount[];
    onDetailsClick: (account: AdAccount) => void;
}

export const BusinessManagerCard: React.FC<BusinessManagerCardProps> = ({ bmName, accounts, onDetailsClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const stats = useMemo(() => {
        const totalAccounts = accounts.length;
        const problematicAccounts = accounts.filter(acc =>
            acc.rejectedAds.length > 0 ||
            acc.status === AdAccountStatus.DISABLED ||
            acc.status === AdAccountStatus.CLOSED
        );
        const totalRejectedAds = accounts.reduce((sum, acc) => sum + acc.rejectedAds.length, 0);
        return {
            totalAccounts,
            problematicAccountsCount: problematicAccounts.length,
            totalRejectedAds,
        };
    }, [accounts]);

    const hasProblems = stats.problematicAccountsCount > 0;
    const cardBorderClass = hasProblems ? 'border-orange-200' : 'border-slate-200';

    return (
        <div className={`bg-white rounded-xl shadow-sm border ${cardBorderClass} transition-all`}>
            <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-4 flex-1">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${hasProblems ? 'bg-orange-100' : 'bg-slate-100'}`}>
                       <BriefcaseIcon className={`w-6 h-6 ${hasProblems ? 'text-orange-500' : 'text-slate-500'}`}/>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">{bmName}</h3>
                        <p className="text-sm text-slate-500">
                            {stats.totalAccounts} Akun Iklan
                        </p>
                    </div>
                </div>
                
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                    <div className="text-left sm:text-right">
                         <p className={`font-semibold ${hasProblems ? 'text-orange-600' : 'text-slate-600'}`}>
                            {stats.problematicAccountsCount} Akun Bermasalah
                        </p>
                        <p className="text-xs text-slate-500">
                            {stats.totalRejectedAds > 0
                                ? `${stats.totalRejectedAds} Total Iklan Ditolak`
                                : (hasProblems ? 'Termasuk akun non-aktif' : 'Tidak ada penolakan')}
                        </p>
                    </div>
                     <button 
                        aria-expanded={isExpanded}
                        className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                     </button>
                </div>
            </div>

            {isExpanded && (
                <div className="px-5 pb-5 border-t border-slate-200/80 mt-2 pt-4 space-y-4">
                    {accounts.length > 0 ? (
                       accounts.map(account => (
                            <AdAccountCard key={account.id} account={account} onDetailsClick={onDetailsClick} />
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-4">Tidak ada akun iklan di Business Manager ini.</p>
                    )}
                </div>
            )}
        </div>
    );
};
