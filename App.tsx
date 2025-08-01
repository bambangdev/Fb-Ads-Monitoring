
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AdAccountTable } from './components/AdAccountTable';
import { AdDetailModal } from './components/AdDetailModal';
import { ConnectView } from './components/ConnectView';
import { AdAccount, AdAccountStatus, SortOption, FilterOption } from './types';
import { fetchAdAccounts } from './services/metaService';
import { StatsSummary } from './components/StatsSummary';

const TOKEN_STORAGE_KEY = 'metaApiToken';

const App: React.FC = () => {
    const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'loading' | 'connected' | 'error'>('disconnected');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('priority');
    const [filterOption, setFilterOption] = useState<FilterOption>('all');
    const [bmFilter, setBmFilter] = useState<string>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // In a real app, dateRange would be used to fetch data
    const [dateRange, setDateRange] = useState<[Date, Date]>([
        new Date(new Date().setDate(new Date().getDate() - 30)),
        new Date(),
    ]);

    const handleConnect = useCallback(async (token: string) => {
        setConnectionStatus('loading');
        setErrorMessage(null);
        try {
            const accounts = await fetchAdAccounts(token);
            setAdAccounts(accounts);
            setConnectionStatus('connected');
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } catch (error: any) {
            console.error("Connection failed:", error);
            setAdAccounts([]);
            setConnectionStatus('error');
            setErrorMessage(error.message || 'Gagal terhubung. Silakan periksa token Anda dan coba lagi.');
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
    }, []);
    
    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (savedToken) {
            handleConnect(savedToken);
        }
    }, [handleConnect]);

    const handleRefresh = useCallback(async () => {
        const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (savedToken && connectionStatus === 'connected' && !isRefreshing) {
            setIsRefreshing(true);
            try {
                const accounts = await fetchAdAccounts(savedToken);
                setAdAccounts(accounts);
            } catch (error: any) {
                console.error("Refresh failed:", error);
                setErrorMessage(error.message || 'Gagal menyegarkan data.');
            } finally {
                setIsRefreshing(false);
            }
        }
    }, [connectionStatus, isRefreshing]);

    const handleDisconnect = useCallback(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setAdAccounts([]);
        setConnectionStatus('disconnected');
        setErrorMessage(null);
    }, []);

    const handleDateChange = useCallback((dates: Date[]) => {
        if (dates.length === 2) {
            setDateRange([dates[0], dates[1]]);
        }
    }, []);
    
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleSortChange = useCallback((option: SortOption) => {
        setSortOption(option);
    }, []);

    const handleFilterChange = useCallback((option: FilterOption) => {
        setFilterOption(option);
    }, []);

    const handleBmFilterChange = useCallback((bm: string) => {
        setBmFilter(bm);
    }, []);

    const handleOpenModal = useCallback((account: AdAccount) => {
        setSelectedAccount(account);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedAccount(null);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleItemsPerPageChange = useCallback((size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1); // Reset to first page when size changes
    }, []);

    const businessManagers = useMemo(() => {
        const bmSet = new Set(adAccounts.map(acc => acc.businessManager));
        return Array.from(bmSet);
    }, [adAccounts]);

    const accountsForStats = useMemo(() => {
        if (bmFilter === 'all') {
            return adAccounts;
        }
        return adAccounts.filter(acc => acc.businessManager === bmFilter);
    }, [adAccounts, bmFilter]);

    const filteredAndSortedAccounts = useMemo(() => {
        let accounts = [...accountsForStats];

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            accounts = accounts.filter(acc => 
                acc.name.toLowerCase().includes(lowercasedQuery) ||
                acc.id.toLowerCase().includes(lowercasedQuery) ||
                acc.businessManager.toLowerCase().includes(lowercasedQuery)
            );
        }
        
        const [startDate, endDate] = dateRange;
        // Create new Date objects to avoid mutating state
        const startOfDay = new Date(new Date(startDate).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(endDate).setHours(23, 59, 59, 999));

        const getRejectionsInRangeCount = (account: AdAccount): number => {
            return account.rejectedAds.filter(ad => {
                const rejectionDate = new Date(ad.rejectionDate);
                return rejectionDate >= startOfDay && rejectionDate <= endOfDay;
            }).length;
        };

        const hasRejectionsInDateRange = (account: AdAccount): boolean => {
            return account.rejectedAds.some(ad => {
                const rejectionDate = new Date(ad.rejectionDate);
                return rejectionDate >= startOfDay && rejectionDate <= endOfDay;
            });
        };

        switch (filterOption) {
            case 'problematic':
                 // Show accounts that are disabled OR have rejections within the date range
                accounts = accounts.filter(acc => 
                    (acc.status === AdAccountStatus.DISABLED || acc.status === AdAccountStatus.CLOSED) || 
                    hasRejectionsInDateRange(acc)
                );
                break;
            case 'disabled':
                // Show disabled accounts, regardless of date range
                accounts = accounts.filter(acc => acc.status === AdAccountStatus.DISABLED || acc.status === AdAccountStatus.CLOSED);
                break;
            case 'with-rejections':
                // Show accounts that have rejections specifically within the date range
                accounts = accounts.filter(acc => hasRejectionsInDateRange(acc));
                break;
            case 'all':
            default:
                // For 'all', we don't filter by rejection status or date, so we show all accounts matching the search/BM filter
                break;
        }

        accounts.sort((a, b) => {
            switch (sortOption) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'rejections': {
                    const aRejections = getRejectionsInRangeCount(a);
                    const bRejections = getRejectionsInRangeCount(b);
                    if (bRejections !== aRejections) return bRejections - aRejections;
                    return a.name.localeCompare(b.name);
                }
                case 'priority':
                default: {
                    const isADisabled = a.status === AdAccountStatus.DISABLED || a.status === AdAccountStatus.CLOSED;
                    const isBDisabled = b.status === AdAccountStatus.DISABLED || b.status === AdAccountStatus.CLOSED;
                    if (isADisabled !== isBDisabled) return isADisabled ? -1 : 1;
                    
                    const aRejectionsInRange = getRejectionsInRangeCount(a);
                    const bRejectionsInRange = getRejectionsInRangeCount(b);

                    if (bRejectionsInRange !== aRejectionsInRange) return bRejectionsInRange - aRejectionsInRange;
                    if (b.rejectedAds.length !== a.rejectedAds.length) return b.rejectedAds.length - a.rejectedAds.length;
                    
                    return a.name.localeCompare(b.name);
                }
            }
        });

        return accounts;
    }, [accountsForStats, searchQuery, sortOption, filterOption, dateRange, bmFilter]);

    // Reset page to 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterOption, sortOption, bmFilter, dateRange]);

    const paginatedAccounts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedAccounts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedAccounts, currentPage, itemsPerPage]);

    const connectViewStatus = connectionStatus === 'error' ? 'error' : (connectionStatus === 'loading' ? 'loading' : 'disconnected');

    return (
        <div className="flex h-screen bg-slate-100 text-slate-800">
            <Sidebar connectionStatus={connectionStatus} onDisconnect={handleDisconnect} />
            <main className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto">
                {connectionStatus === 'connected' ? (
                    <>
                        <StatsSummary accounts={accountsForStats} />
                        <Header
                            onDateChange={handleDateChange}
                            searchQuery={searchQuery}
                            onSearchChange={handleSearchChange}
                            sortOption={sortOption}
                            onSortChange={handleSortChange}
                            filterOption={filterOption}
                            onFilterChange={handleFilterChange}
                            businessManagers={businessManagers}
                            bmFilter={bmFilter}
                            onBmFilterChange={handleBmFilterChange}
                            onRefresh={handleRefresh}
                            isRefreshing={isRefreshing}
                        />
                        <div className="mt-6">
                            {adAccounts.length > 0 ? (
                                filteredAndSortedAccounts.length > 0 ? (
                                    <AdAccountTable 
                                        accounts={paginatedAccounts}
                                        onDetailsClick={handleOpenModal}
                                        currentPage={currentPage}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={filteredAndSortedAccounts.length}
                                        onPageChange={handlePageChange}
                                        onItemsPerPageChange={handleItemsPerPageChange}
                                        dateRange={dateRange}
                                    />
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                                        <h3 className="text-xl font-semibold text-slate-700">Tidak Ada Akun yang Sesuai</h3>
                                        <p className="text-slate-500 mt-2">Coba sesuaikan filter atau rentang tanggal Anda.</p>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                                    <h3 className="text-xl font-semibold text-slate-700">Tidak Ada Akun Iklan</h3>
                                    <p className="text-slate-500 mt-2">Tidak ada akun iklan yang ditemukan untuk pengguna yang terhubung.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <ConnectView
                        status={connectViewStatus}
                        onConnect={handleConnect}
                        errorMessage={errorMessage}
                    />
                )}
            </main>
            {isModalOpen && selectedAccount && (
                <AdDetailModal account={selectedAccount} onClose={handleCloseModal} dateRange={dateRange} />
            )}
        </div>
    );
};

export default App;
