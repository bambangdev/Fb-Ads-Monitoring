// components/Dashboard.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { AdAccount } from '../types/adAccount';
import { fetchAdAccounts } from '../services/metaService';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatsSummary } from './StatsSummary';
import { BusinessManagerCard } from './BusinessManagerCard';
import { AdDetailModal } from './AdDetailModal';
import { LoadingSpinnerIcon } from './icons';
import { useToast } from './ui/use-toast';
import { FilterOption, SortOption } from '../types';

// Konstanta untuk manajemen cache
const CACHE_KEY = 'ad_accounts_cache';
const CACHE_TIMESTAMP_KEY = 'ad_accounts_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // Cache berlaku selama 5 menit

interface DashboardProps {
  adAccounts: AdAccount[];
  setAdAccounts: (accounts: AdAccount[]) => void;
  accessToken: string;
  onDisconnect: () => void;
}

/**
 * [BARU] Komponen untuk menampilkan indikator pemuatan yang jelas
 * kepada pengguna saat data sedang diambil di latar belakang.
 */
const LoadingIndicator: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-100/80 absolute top-0 left-0 z-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-lg">
            <LoadingSpinnerIcon className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
            <p className="mt-4 text-lg font-semibold text-slate-700">Mengambil data akun iklan Anda...</p>
            <p className="text-slate-500 mt-1">Ini mungkin memakan waktu beberapa saat. Mohon tunggu.</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ adAccounts, setAdAccounts, accessToken, onDisconnect }) => {
    const [isDataLoading, setIsDataLoading] = useState(true);
    const { toast } = useToast();
    const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);

    // [MODIFIKASI] Logika pengambilan data dan cache dipindahkan ke sini
    useEffect(() => {
        const loadAccounts = async () => {
            if (!accessToken) return;

            setIsDataLoading(true);
            try {
                const cachedData = localStorage.getItem(CACHE_KEY);
                const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
                let isCacheValid = false;

                if (cacheTimestamp) {
                    const cacheAge = new Date().getTime() - new Date(cacheTimestamp).getTime();
                    if (cacheAge < CACHE_DURATION) isCacheValid = true;
                }

                if (cachedData && isCacheValid) {
                    setAdAccounts(JSON.parse(cachedData));
                } else {
                    const accounts = await fetchAdAccounts(accessToken);
                    setAdAccounts(accounts);
                    localStorage.setItem(CACHE_KEY, JSON.stringify(accounts));
                    localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
                    toast({
                        title: 'Data Diperbarui',
                        description: `Berhasil mengambil ${accounts.length} akun iklan.`,
                    });
                }
            } catch (error) {
                console.error('Gagal mengambil data akun iklan:', error);
                toast({
                    variant: 'destructive',
                    title: 'Gagal Mengambil Data',
                    description: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.',
                });
            } finally {
                setIsDataLoading(false);
            }
        };

        loadAccounts();
    }, [accessToken, setAdAccounts, toast]);
    
    // Logika untuk mengelompokkan akun berdasarkan Business Manager
    const groupedByBm = useMemo(() => {
        return adAccounts.reduce((acc, account) => {
            const bmName = account.businessManager || 'Akun Personal';
            if (!acc[bmName]) acc[bmName] = [];
            acc[bmName].push(account);
            return acc;
        }, {} as Record<string, AdAccount[]>);
    }, [adAccounts]);
    
    // Dummy state untuk kontrol header
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('priority');
    const [filterOption, setFilterOption] = useState<FilterOption>('all');
    const [bmFilter, setBmFilter] = useState('all');

    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar onDisconnect={onDisconnect} connectionStatus={'connected'} />
            <main className="flex-1 flex flex-col overflow-hidden">
                {isDataLoading && <LoadingIndicator />}
                <div className="flex-1 p-6 lg:p-8 overflow-y-auto relative">
                    <Header
                        onDateChange={() => {}}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        sortOption={sortOption}
                        onSortChange={setSortOption}
                        filterOption={filterOption}
                        onFilterChange={setFilterOption}
                        businessManagers={Object.keys(groupedByBm)}
                        bmFilter={bmFilter}
                        onBmFilterChange={setBmFilter}
                        onRefresh={() => { /* Logika untuk muat ulang data bisa ditambahkan di sini */ }}
                        isRefreshing={isDataLoading}
                    />
                    <StatsSummary accounts={adAccounts} />
                    <div className="space-y-6 mt-6">
                        {Object.entries(groupedByBm).map(([bmName, accounts]) => (
                            <BusinessManagerCard
                                key={bmName}
                                bmName={bmName}
                                accounts={accounts}
                                onDetailsClick={setSelectedAccount}
                            />
                        ))}
                    </div>
                </div>
            </main>
            <AdDetailModal 
                account={selectedAccount}
                isOpen={!!selectedAccount}
                onClose={() => setSelectedAccount(null)}
                accessToken={accessToken}
            />
        </div>
    );
};

export default Dashboard;