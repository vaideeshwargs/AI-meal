import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 text-white px-3.5 py-2 text-xs font-semibold shadow-lg backdrop-blur border border-amber-400/40 animate-fade-in">
      <WifiOff className="w-4 h-4 animate-pulse text-amber-100" />
      <span>Offline Mode — Serving cached recipes and meal plan.</span>
    </div>
  );
};
