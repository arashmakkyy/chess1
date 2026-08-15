import React from 'react';
import { Lock, Unlock, ShieldCheck, LogOut } from 'lucide-react';

interface AdminStatusBadgeProps {
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({
  isAdmin,
  onLoginClick,
  onLogoutClick
}) => {
  if (isAdmin) {
    return (
      <div
        id="admin-status-active"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        <span>دسترسی مدیریت فعال</span>
        <button
          id="btn-admin-logout"
          onClick={onLogoutClick}
          className="mr-1 p-1 hover:bg-amber-500/20 rounded text-amber-300 hover:text-amber-200 transition-all cursor-pointer"
          title="خروج از حالت مدیریت"
        >
          <LogOut className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      id="btn-admin-login-prompt"
      onClick={onLoginClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10 transition-all cursor-pointer"
      title="ورود با رمز مدیریت جهت ویرایش نتایج و بازنشانی"
    >
      <Lock className="w-3 h-3 text-slate-400" />
      <span>حالت تماشا (ورود مدیر)</span>
    </button>
  );
};
