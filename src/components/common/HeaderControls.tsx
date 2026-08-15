import React from 'react';
import { RotateCcw, RefreshCw } from 'lucide-react';
import { SyncStatusBadge, SyncStatus } from './SyncStatusBadge';
import { AdminStatusBadge } from '../auth/AdminStatusBadge';

interface HeaderControlsProps {
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onRefresh: () => void;
  onReset: () => void;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  syncStatus,
  lastSyncTime,
  isAdmin,
  onLoginClick,
  onLogoutClick,
  onRefresh,
  onReset
}) => {
  return (
    <div id="header-action-controls" className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
      <AdminStatusBadge
        isAdmin={isAdmin}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
      />

      <SyncStatusBadge
        status={syncStatus}
        lastSyncTime={lastSyncTime}
        onManualRefresh={onRefresh}
      />

      <button
        id="btn-refresh-server-data"
        onClick={onRefresh}
        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        title="بارگذاری مجدد اطلاعات از سرور"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>

      <button
        id="btn-reset-league"
        onClick={onReset}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-xs font-bold text-slate-400 transition-all cursor-pointer"
        title="شروع مجدد لیگ"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>بازنشانی کل لیگ</span>
      </button>
    </div>
  );
};
