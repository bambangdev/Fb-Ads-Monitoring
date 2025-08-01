import React from 'react';
import { LogoIcon, DashboardIcon, CampaignIcon, ReportIcon, SettingsIcon, UserIcon, LogoutIcon } from './icons';

interface SidebarProps {
    connectionStatus: 'disconnected' | 'loading' | 'connected' | 'error';
    onDisconnect: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ connectionStatus, onDisconnect }) => {
    return (
        <aside className="w-64 bg-slate-900 text-white flex-col hidden lg:flex">
            <div className="px-6 py-4 border-b border-slate-700">
                <h1 className="text-2xl font-bold text-white flex items-center">
                    <LogoIcon className="mr-2 text-blue-400" />
                    AdMonitor
                </h1>
            </div>
            <nav className="flex-grow px-4 py-4 space-y-2">
                <a href="#" className="flex items-center px-4 py-2.5 bg-slate-800 rounded-lg font-semibold">
                    <DashboardIcon className="mr-3" />
                    Dashboard
                </a>
                <a href="#" className="flex items-center px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all">
                    <CampaignIcon className="mr-3" />
                    Kampanye
                </a>
                <a href="#" className="flex items-center px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all">
                    <ReportIcon className="mr-3" />
                    Laporan
                </a>
            </nav>
            
            <div className="flex-shrink-0">
                {connectionStatus === 'connected' && (
                    <div className="px-6 py-5 space-y-4 border-t border-slate-700">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <UserIcon className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">Pengguna Meta</p>
                                <p className="text-xs text-slate-400">Terhubung</p>
                            </div>
                        </div>
                        <button
                            onClick={onDisconnect}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/80 text-slate-300 font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <LogoutIcon className="w-5 h-5"/>
                            Putuskan
                        </button>
                    </div>
                )}
                <div className="p-6 border-t border-slate-700">
                    <a href="#" className="flex items-center px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all">
                        <SettingsIcon className="mr-3" />
                        Pengaturan
                    </a>
                </div>
            </div>
        </aside>
    );
};