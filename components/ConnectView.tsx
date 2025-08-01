
import React, { useState, FormEvent } from 'react';
import { FacebookIcon, KeyIcon, LoadingSpinnerIcon } from './icons';

interface ConnectViewProps {
    status: 'disconnected' | 'loading' | 'error';
    onConnect: (token: string) => void;
    errorMessage: string | null;
}

export const ConnectView: React.FC<ConnectViewProps> = ({ status, onConnect, errorMessage }) => {
    const [token, setToken] = useState('');
    const isLoading = status === 'loading';

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (token.trim()) {
            onConnect(token.trim());
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center w-full">
            <div className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-lg w-full">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                    <FacebookIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Hubungkan dengan Meta Graph API</h2>
                <p className="text-slate-500 mt-3">
                    Masukkan token akses Anda untuk menghubungkan dan mengambil data akun iklan yang ditolak. Anda bisa mendapatkannya dari <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Graph API Explorer</a>.
                </p>
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div className="relative">
                        <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Masukkan Token Akses Graph API Anda"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            aria-label="Access Token Input"
                            disabled={isLoading}
                        />
                    </div>
                     {status === 'error' && errorMessage && (
                        <p className="text-red-600 text-sm text-left bg-red-50 p-3 rounded-lg">
                            <strong>Koneksi Gagal:</strong> {errorMessage}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading || !token}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingSpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> : <FacebookIcon className="w-5 h-5" />}
                        {isLoading ? 'Menghubungkan...' : 'Hubungkan & Muat Akun'}
                    </button>
                </form>
            </div>
        </div>
    );
};
