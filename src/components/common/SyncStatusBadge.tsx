import React from 'react';
import { Cloud, CloudCheck, RefreshCw, AlertCircle } from 'lucide-react';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  lastSyncTime?: Date | null;
  onManualRefresh?: () => void;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  status,
  lastSyncTime,
  onManualRefresh
}) => {
  return (
    <div
      id="sync-status-indicator"
      onClick={onManualRefresh}
      title={
        status === 'synced'
          ? 'داده‌ها با بک‌اند هماهنگ هستند. برای بازیابی مجدد کلیک کنید.'
          : status === 'syncing'
          ? 'در حال ذخیره‌سازی روی بک‌اند...'
          : 'حالت آفلاین (استفاده از حافظه لوکال)'
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer select-none ${
        status === 'synced'
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
          : status === 'syncing'
          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 animate-pulse'
          : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
      }`}
    >
      <span className="relative flex h-2 w-2">
        {status === 'syncing' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            status === 'synced'
              ? 'bg-emerald-400'
              : status === 'syncing'
              ? 'bg-amber-400'
              : 'bg-rose-400'
          }`}
        ></span>
      </span>

      {status === 'synced' && (
        <span className="flex items-center gap-1">
          <span>سینک با بک‌اند</span>
        </span>
      )}
      {status === 'syncing' && <span>در حال ذخیره...</span>}
      {status === 'offline' && <span>آفلاین (لوکال)</span>}
      {status === 'error' && <span>خطای اتصال</span>}
    </div>
  );
};
