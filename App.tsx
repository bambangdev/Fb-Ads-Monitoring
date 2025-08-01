// App.tsx

import { useState, useCallback, useEffect } from 'react';
import { AdAccount } from './types/adAccount';
import ConnectScreen from './components/ConnectScreen';
import Dashboard from './components/Dashboard';
import { Toaster } from './components/ui/toaster';
import { useToast } from './components/ui/use-toast';

const TOKEN_STORAGE_KEY = 'meta_ad_manager_token';

function App() {
  const { toast } = useToast();
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  /**
   * [MODIFIKASI] Fungsi ini sekarang hanya menyimpan token dan mengubah
   * status koneksi untuk mengarahkan pengguna ke dasbor.
   */
  const handleConnect = useCallback(
    (token: string) => {
      if (!token.trim()) {
        toast({
          variant: 'destructive',
          title: 'Token Kosong',
          description: 'Harap masukkan token akses yang valid.',
        });
        return;
      }
      setConnectionStatus('connecting');
      setAccessToken(token);
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      setConnectionStatus('connected');
      toast({
        title: 'Berhasil Terhubung!',
        description: 'Mengarahkan Anda ke dasbor...',
      });
    },
    [toast],
  );

  /**
   * [MODIFIKASI] useEffect hanya memeriksa token yang tersimpan untuk
   * langsung mengarahkan ke dasbor jika sesi sudah ada.
   */
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (savedToken) {
      setAccessToken(savedToken);
      setConnectionStatus('connected');
    }
  }, []);

  const handleDisconnect = () => {
    // Hapus semua data dari localStorage untuk memastikan sesi bersih
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('ad_accounts_cache');
    localStorage.removeItem('ad_accounts_cache_timestamp');
    setAccessToken(null);
    setAdAccounts([]);
    setConnectionStatus('disconnected');
    toast({
      title: 'Koneksi Terputus',
      description: 'Anda telah berhasil keluar.',
    });
  };

  return (
    <>
      <div className="min-h-screen bg-slate-100 text-slate-800">
        {/*
         * [MODIFIKASI] Logika render diubah untuk menampilkan dasbor
         * segera setelah status 'connected', lalu dasbor akan
         * menangani pemuatan datanya sendiri.
         */}
        {connectionStatus === 'connected' ? (
            <Dashboard
                adAccounts={adAccounts}
                setAdAccounts={setAdAccounts}
                accessToken={accessToken!}
                onDisconnect={handleDisconnect}
            />
        ) : (
            <ConnectScreen
                onConnect={handleConnect}
                isLoading={connectionStatus === 'connecting'}
            />
        )}
      </div>
      <Toaster />
    </>
  );
}

export default App;