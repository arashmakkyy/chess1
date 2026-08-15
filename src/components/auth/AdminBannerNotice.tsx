import React from 'react';
import { Lock, ShieldCheck, KeyRound } from 'lucide-react';

interface AdminBannerNoticeProps {
  isAdmin: boolean;
  onOpenLogin: () => void;
}

export const AdminBannerNotice: React.FC<AdminBannerNoticeProps> = ({
  isAdmin,
  onOpenLogin
}) => {
  if (isAdmin) {
    return (
      <div
        id="admin-banner-notice-active"
        className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-2.5 mb-6 flex items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2 text-amber-300 font-bold">
          <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
          <span>پنل مدیریت فعال است — شما امکان ثبت نتایج، قرعه‌کشی مجدد و تغییرات لیگ را دارید.</span>
        </div>
        <span className="text-[10px] text-amber-400/80 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Admin Authenticated
        </span>
      </div>
    );
  }

  return (
    <div
      id="admin-banner-notice-guest"
      className="w-full bg-slate-900/60 border border-white/5 rounded-2xl px-4 py-2.5 mb-6 flex items-center justify-between gap-3 text-xs backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 text-slate-400">
        <Lock className="w-3.5 h-3.5 shrink-0 text-slate-500" />
        <span>شما در حالت مشاهده عمومی هستید. برای اعمال تغییرات و ثبت نتایج، رمز مدیریت لازم است.</span>
      </div>
      <button
        onClick={onOpenLogin}
        className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-bold border border-white/10 transition-all cursor-pointer"
      >
        <KeyRound className="w-3 h-3 text-amber-400" />
        <span>ورود به مدیریت</span>
      </button>
    </div>
  );
};
