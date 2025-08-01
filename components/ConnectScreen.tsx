// components/ConnectScreen.tsx

import React from 'react';
import { ConnectView } from './ConnectView';

interface ConnectScreenProps {
    onConnect: (token: string) => void;
    isLoading: boolean;
}

const ConnectScreen: React.FC<ConnectScreenProps> = ({ onConnect, isLoading }) => {
    // Di sini Anda bisa menambahkan elemen layout lain jika diperlukan
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
             <ConnectView
                status={isLoading ? 'loading' : 'disconnected'}
                onConnect={onConnect}
                errorMessage={null} // Bisa dihubungkan ke state error jika perlu
            />
        </div>
    );
};

export default ConnectScreen;