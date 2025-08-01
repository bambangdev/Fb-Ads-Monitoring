
import React, { useMemo } from 'react';
import { AdAccount, AdAccountStatus } from '../types';
import { HighRejectionIcon, MediumRejectionIcon, NoRejectionIcon, DisabledIcon } from './icons';

interface AdAccountCardProps {
    account: AdAccount;
    onDetailsClick: (account: AdAccount) => void;
}

const getAccountDisplayInfo = (account: AdAccount) => {
    if (account.status === AdAccountStatus.DISABLED || account.status === AdAccountStatus.CLOSED) {
        return {
            icon: <DisabledIcon className="text-red-500" />,
            cardClass: 'border-red-200 bg-red-50/50',
            rejectionTextClass: 'text-red-700',
            iconBgClass: 'bg-red-100',
            statusBadge: (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-md border border-red-200">
                    {account.status === AdAccountStatus.DISABLED ? 'Disabled' : 'Closed'}
                </span>
            )
        };
    }

    const rejectedCount = account.rejectedAds.length;

    if (rejectedCount >= 5) {
        return {
            icon: <HighRejectionIcon className="text-red-500" />,
            cardClass: 'border-red-200',
            rejectionTextClass: 'text-red-600',
            iconBgClass: 'bg-red-100',
            statusBadge: null,
        };
    }
    if (rejectedCount > 0) {
        return {
            icon: <MediumRejectionIcon className="text-orange-500" />,
            cardClass: 'border-orange-200',
            rejectionTextClass: 'text-orange-600',
            iconBgClass: 'bg-orange-100',
            statusBadge: null,
        };
    }
    return {
        icon: <NoRejectionIcon className="text-green-500" />,
        cardClass: 'border-gray-200 opacity-70',
        rejectionTextClass: 'text-green-600',
        iconBgClass: 'bg-green-100',
        statusBadge: null,
    };
};


export const AdAccountCard: React.FC<AdAccountCardProps> = ({ account, onDetailsClick }) => {
    const rejectedCount = account.rejectedAds.length;
    const displayInfo = useMemo(() => getAccountDisplayInfo(account), [account]);
    const lastRejectionDate = rejectedCount > 0 ? account.rejectedAds[0].rejectionDate : null;
    const isAccountDisabled = account.status === AdAccountStatus.DISABLED || account.status === AdAccountStatus.CLOSED;

    return (
        <div className={`bg-white p-5 rounded-xl border shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 ${displayInfo.cardClass}`}>
            <div className={`flex-shrink-0 w-12 h-12 ${displayInfo.iconBgClass} rounded-lg flex items-center justify-center`}>
                {displayInfo.icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-500">{account.businessManager}</p>
                <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-800">{account.name}</h3>
                    {displayInfo.statusBadge}
                </div>
                <p className="text-sm text-gray-600">ID: {account.id}</p>
            </div>
            <div className="w-full sm:w-auto text-left sm:text-right">
                <div className="flex items-center justify-start sm:justify-end gap-2">
                    {isAccountDisabled ? (
                        <span className={`text-sm font-medium ${displayInfo.rejectionTextClass}`}>Akun Dinonaktifkan</span>
                    ) : (
                        <>
                            <span className={`text-xl font-bold ${displayInfo.rejectionTextClass}`}>{rejectedCount}</span>
                            <span className={`text-sm font-medium ${displayInfo.rejectionTextClass}`}>Iklan Ditolak</span>
                        </>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                    {isAccountDisabled
                        ? (rejectedCount > 0 ? `Ditemukan ${rejectedCount} iklan ditolak` : 'Status akun tidak aktif')
                        : (rejectedCount > 0 && lastRejectionDate
                            ? `Terakhir ditolak: ${lastRejectionDate}`
                            : 'Semua iklan berjalan lancar')}
                </p>
            </div>
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
                <button 
                    onClick={() => onDetailsClick(account)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:bg-blue-300 disabled:cursor-not-allowed"
                    disabled={rejectedCount === 0}
                >
                    Lihat Detail
                </button>
            </div>
        </div>
    );
};
