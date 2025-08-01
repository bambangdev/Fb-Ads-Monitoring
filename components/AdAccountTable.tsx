
import React from 'react';
import { AdAccount, AdAccountStatus } from '../types';
import { Pagination } from './Pagination';

interface AdAccountTableProps {
    accounts: AdAccount[];
    onDetailsClick: (account: AdAccount) => void;
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (size: number) => void;
    dateRange: [Date, Date];
}

const StatusBadge: React.FC<{ status: AdAccountStatus }> = ({ status }) => {
    let text: string;
    let classes: string;

    switch (status) {
        case AdAccountStatus.ACTIVE:
            text = 'Active';
            classes = 'bg-green-100 text-green-800 border-green-200';
            break;
        case AdAccountStatus.DISABLED:
            text = 'Disabled';
            classes = 'bg-red-100 text-red-800 border-red-200';
            break;
        case AdAccountStatus.CLOSED:
             text = 'Closed';
             classes = 'bg-slate-100 text-slate-800 border-slate-200';
             break;
        case AdAccountStatus.UNSETTLED:
            text = 'Unsettled';
            classes = 'bg-yellow-100 text-yellow-800 border-yellow-200';
            break;
        default:
            text = status.replace(/_/g, ' ');
            classes = 'bg-slate-100 text-slate-600 border-slate-200 capitalize';
    }

    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${classes}`}>
            {text}
        </span>
    );
};

export const AdAccountTable: React.FC<AdAccountTableProps> = ({ 
    accounts, 
    onDetailsClick,
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    dateRange
}) => {
    const [startDate, endDate] = dateRange;
    const startOfDay = new Date(new Date(startDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(endDate).setHours(23, 59, 59, 999));

    const getRejectionsInRangeCount = (account: AdAccount): number => {
        return account.rejectedAds.filter(ad => {
            const rejectionDate = new Date(ad.rejectionDate);
            return rejectionDate >= startOfDay && rejectionDate <= endOfDay;
        }).length;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50/80">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Akun Iklan</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Masalah Ditemukan</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(account => {
                            const rejectionsInDateRangeCount = getRejectionsInRangeCount(account);
                            return (
                                <tr key={account.id} className="bg-white border-b last:border-b-0 border-slate-200 hover:bg-slate-50/70 transition-colors">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                        <div className="font-semibold text-base text-slate-800">{account.name}</div>
                                        <div className="font-normal text-slate-500">{account.businessManager}</div>
                                        <div className="font-mono text-xs text-slate-400 mt-1">{account.id}</div>
                                    </th>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={account.status} />
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {rejectionsInDateRangeCount > 0 ? (
                                            <span className="text-orange-600">{rejectionsInDateRangeCount} Iklan Ditolak</span>
                                        ) : (
                                            account.status === AdAccountStatus.ACTIVE ? 
                                                <span className="text-green-600">Aman</span> : 
                                                <span className="text-slate-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => onDetailsClick(account)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                                            disabled={rejectionsInDateRangeCount === 0 && account.status === AdAccountStatus.ACTIVE}
                                            aria-label={`Lihat detail untuk ${account.name}`}
                                        >
                                            Lihat Detail
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {totalItems > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                    onItemsPerPageChange={onItemsPerPageChange}
                />
            )}
        </div>
    );
};
