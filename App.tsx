// App.tsx

import { useState, useCallback, useEffect } from 'react';
import { AdAccount } from './types/adAccount';
import { fetchAdAccounts } from './services/metaService';
import ConnectScreen from './components/ConnectScreen';
import Dashboard from './components/Dashboard';
import { Toaster } from './components/ui/toaster';
import { useToast } from './components/ui/use-toast';

const TOKEN_STORAGE_KEY = 'meta_ad_manager_token';
const CACHE_KEY = 'ad_accounts_cache';
const CACHE_TIMESTAMP_KEY = 'ad_accounts_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // Cache berlaku selama 5 menit

function App() {
  const { toast } = useToast();
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // [MODIFIKASI] handleConnect sekarang juga menyimpan data ke cache
  const handleConnect = useCallback(
    async (token: string) => {
      setConnectionStatus('connecting');
      setAccessToken(token);
      try {
        const accounts = await fetchAdAccounts(token);
        setAdAccounts(accounts);
        setConnectionStatus('connected');
        localStorage.setItem(TOKEN_STORAGE_KEY, token);

        // Simpan data dan timestamp ke localStorage sebagai cache
        localStorage.setItem(CACHE_KEY, JSON.stringify(accounts));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());

        toast({
          title: 'Connection Successful',
          description: `Successfully fetched ${accounts.length} ad accounts.`,
        });
      } catch (error) {
        console.error('Failed to connect or fetch ad accounts:', error);
        setConnectionStatus('error');
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred.',
        });
      }
    },
    [toast],
  );

  // [MODIFIKASI] useEffect sekarang memuat dari cache terlebih dahulu
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    let isCacheValid = false;
    if (cacheTimestamp) {
      const cacheAge = new Date().getTime() - new Date(cacheTimestamp).getTime();
      if (cacheAge < CACHE_DURATION) {
        isCacheValid = true;
      }
    }

    // Jika ada token dan cache yang valid, muat dari cache dulu
    if (savedToken && cachedData && isCacheValid) {
      console.log('Loading data from valid cache.');
      setAdAccounts(JSON.parse(cachedData));
      setConnectionStatus('connected');
      setAccessToken(savedToken);
      // Tetap panggil handleConnect untuk refresh data di latar belakang
      handleConnect(savedToken);
    } else if (savedToken) {
      // Jika hanya ada token (cache tidak valid atau tidak ada), langsung fetch
      console.log('No valid cache. Fetching fresh data.');
      handleConnect(savedToken);
    }
  }, [handleConnect]);

  const handleDisconnect = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(CACHE_KEY); // Hapus cache saat disconnect
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    setAccessToken(null);
    setAdAccounts([]);
    setConnectionStatus('disconnected');
    toast({
      title: 'Disconnected',
      description: 'You have been successfully disconnected.',
    });
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        {connectionStatus === 'disconnected' ||
        connectionStatus === 'error' ? (
          <ConnectScreen
            onConnect={handleConnect}
            isLoading={connectionStatus === 'connecting'}
          />
        ) : (
          <Dashboard
            adAccounts={adAccounts}
            setAdAccounts={setAdAccounts} // Kirim setAdAccounts ke Dashboard
            accessToken={accessToken!}
            isLoading={connectionStatus === 'connecting'}
            onDisconnect={handleDisconnect}
          />
        )}
      </div>
      <Toaster />
    </>
  );
}

export default App;