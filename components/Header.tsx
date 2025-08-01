
import React from 'react';
import { DatePicker } from './DatePicker';
import { SearchIcon, SortIcon, FilterIcon, BriefcaseIcon, RefreshCwIcon, LoadingSpinnerIcon } from './icons';
import { SortOption, FilterOption } from '../types';

interface HeaderProps {
    onDateChange: (dates: Date[]) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sortOption: SortOption;
    onSortChange: (option: SortOption) => void;
    filterOption: FilterOption;
    onFilterChange: (option: FilterOption) => void;
    businessManagers: string[];
    bmFilter: string;
    onBmFilterChange: (bm: string) => void;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    onDateChange,
    searchQuery,
    onSearchChange,
    sortOption,
    onSortChange,
    filterOption,
    onFilterChange,
    businessManagers,
    bmFilter,
    onBmFilterChange,
    onRefresh,
    isRefreshing
}) => {
    return (
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Skrining Akun Iklan</h2>
                <p className="text-gray-500 mt-1">Tinjau semua akun iklan Anda dalam satu tampilan tabel.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-center gap-3 w-full lg:w-auto">
                 <div className="relative w-full lg:w-48">
                    <input
                        type="text"
                        placeholder="Cari nama atau ID..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-white border border-gray-300 pl-10 pr-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        aria-label="Cari Akun Iklan"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative w-full lg:w-auto">
                    <select
                        id="bm-filter-select"
                        value={bmFilter}
                        onChange={(e) => onBmFilterChange(e.target.value)}
                        className="appearance-none w-full bg-white border border-gray-300 pl-10 pr-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                        aria-label="Filter by Business Manager"
                    >
                        <option value="all">Semua BM</option>
                        {businessManagers.map(bm => (
                            <option key={bm} value={bm}>{bm}</option>
                        ))}
                    </select>
                    <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                </div>
                 <div className="relative w-full lg:w-auto">
                    <select
                        id="filter-select"
                        value={filterOption}
                        onChange={(e) => onFilterChange(e.target.value as FilterOption)}
                        className="appearance-none w-full bg-white border border-gray-300 pl-10 pr-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                        aria-label="Filter Akun"
                    >
                        <option value="all">Filter: Semua</option>
                        <option value="problematic">Filter: Bermasalah</option>
                        <option value="disabled">Filter: Nonaktif</option>
                        <option value="with-rejections">Filter: Ditolak</option>
                    </select>
                    <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative w-full lg:w-auto">
                    <select
                        id="sort-select"
                        value={sortOption}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="appearance-none w-full bg-white border border-gray-300 pl-10 pr-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                        aria-label="Urutkan Akun"
                    >
                        <option value="priority">Urutkan: Prioritas</option>
                        <option value="name">Urutkan: Nama</option>
                        <option value="rejections">Urutkan: Penolakan</option>
                    </select>
                    <SortIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative w-full lg:w-auto">
                    <DatePicker onDateChange={onDateChange} />
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="flex items-center justify-center w-full lg:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-70 disabled:cursor-wait"
                    aria-label="Muat Ulang Data"
                    title="Muat Ulang Data"
                >
                    {isRefreshing ? (
                        <>
                            <LoadingSpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-600" />
                            <span>Memuat...</span>
                        </>
                    ) : (
                        <>
                            <RefreshCwIcon className="w-5 h-5 mr-2 text-gray-600" />
                            <span>Muat Ulang</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    );
};
