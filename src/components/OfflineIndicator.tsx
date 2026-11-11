import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 backdrop-blur-xl border border-amber-300/40 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-2xl"
    >
      <span className="h-2 w-2 rounded-full bg-slate-950 animate-pulse" />
      <WifiOff className="w-3.5 h-3.5" />
      <span>Modo Offline — Dados em cache local ativos</span>
    </div>
  );
};
