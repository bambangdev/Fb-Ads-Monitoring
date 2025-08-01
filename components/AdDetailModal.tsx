// components/AdDetailModal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdAccount } from '@/types/adAccount';
import { useEffect, useState } from 'react';
import { fetchAdAccountDetails } from '@/services/metaService';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

interface AdDetailModalProps {
  account: AdAccount | null;
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
}

export function AdDetailModal({
  account,
  isOpen,
  onClose,
  accessToken,
}: AdDetailModalProps) {
  const [details, setDetails] = useState<Pick<
    AdAccount,
    'rejectedAds' | 'campaigns'
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // [MODIFIKASI] Gunakan useEffect untuk mengambil data detail saat modal dibuka
  useEffect(() => {
    // Hanya fetch jika modal dibuka, ada akun, dan data detail belum dimuat
    if (isOpen && account && !details) {
      const loadDetails = async () => {
        setIsLoading(true);
        try {
          // Panggil fungsi baru untuk mengambil detail spesifik akun ini
          const accountDetails = await fetchAdAccountDetails(
            account.id,
            accessToken,
          );
          setDetails(accountDetails);
        } catch (error) {
          console.error(`Failed to fetch details for ${account.id}:`, error);
          // Anda bisa menambahkan state untuk error di sini
        } finally {
          setIsLoading(false);
        }
      };
      loadDetails();
    }
    // Reset state saat modal ditutup
    if (!isOpen) {
      setDetails(null);
    }
  }, [isOpen, account, accessToken, details]);

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Details for: {account.name} ({account.id})
          </DialogTitle>
        </DialogHeader>

        {/* [MODIFIKASI] Tampilkan skeleton loading saat data diambil */}
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 overflow-y-auto">
            {/* Bagian Iklan Ditolak */}
            <div>
              <h3 className="font-bold text-lg mb-2">
                Rejected/Problematic Ads (
                {details?.rejectedAds.length || 0})
              </h3>
              <div className="space-y-2">
                {details?.rejectedAds.length ? (
                  details.rejectedAds.map(ad => (
                    <div key={ad.id} className="p-2 border rounded">
                      <p className="font-semibold">{ad.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {ad.issues}
                      </p>
                      <Badge variant="destructive">{ad.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p>No rejected ads found.</p>
                )}
              </div>
            </div>

            {/* Bagian Kampanye */}
            <div>
              <h3 className="font-bold text-lg mb-2">
                Campaigns ({details?.campaigns.length || 0})
              </h3>
              <div className="space-y-2">
                {details?.campaigns.length ? (
                  details.campaigns.map(c => (
                    <div key={c.id} className="p-2 border rounded">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm">Objective: {c.objective}</p>
                      <Badge>{c.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p>No campaigns found.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}