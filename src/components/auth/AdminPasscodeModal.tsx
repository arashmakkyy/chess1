import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, X, Check, ShieldAlert, ShieldCheck } from 'lucide-react';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  actionTitle?: string;
  onSuccess: (passcode: string) => boolean;
  onCancel: () => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  actionTitle = 'دسترسی مدیریت لیگ',
  onSuccess,
  onCancel
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError(false);
      setShake(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passcode) return;

    const isCorrect = onSuccess(passcode);
    if (!isCorrect) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleDigitClick = (num: string) => {
    if (passcode.length < 4) {
      const nextCode = passcode + num;
      setPasscode(nextCode);
      setError(false);
      if (nextCode.length === 4) {
        setTimeout(() => {
          const isCorrect = onSuccess(nextCode);
          if (!isCorrect) {
            setError(true);
            setShake(true);
            setTimeout(() => setShake(false), 500);
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPasscode((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div
      id="admin-passcode-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onCancel}
    >
      <div
        id="admin-passcode-modal-box"
        className={`relative w-full max-w-sm rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl text-right transition-transform ${
          shake ? 'animate-bounce' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-passcode-modal"
          onClick={onCancel}
          className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-100">{actionTitle}</h3>
          <p className="text-xs text-slate-400 mt-1">
            برای انجام تغییرات، ثبت نتایج و بازنشانی، رمز عبور مدیریت را وارد نمایید.
          </p>
        </div>

        {/* Form & PIN dots */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          {/* Hidden text input for keyboard entry */}
          <input
            ref={inputRef}
            type="password"
            maxLength={4}
            value={passcode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
              setPasscode(val);
              setError(false);
              if (val.length === 4) {
                setTimeout(() => {
                  const isCorrect = onSuccess(val);
                  if (!isCorrect) {
                    setError(true);
                    setShake(true);
                    setTimeout(() => setShake(false), 500);
                  }
                }, 150);
              }
            }}
            className="sr-only"
            autoFocus
          />

          {/* 4-digit PIN representation */}
          <div
            className="flex items-center justify-center gap-3 my-4 cursor-pointer"
            onClick={() => inputRef.current?.focus()}
          >
            {[0, 1, 2, 3].map((index) => {
              const isFilled = passcode.length > index;
              return (
                <div
                  key={index}
                  className={`w-11 h-12 rounded-xl flex items-center justify-center font-mono text-lg font-black transition-all ${
                    error
                      ? 'border-2 border-rose-500 bg-rose-500/10 text-rose-300'
                      : isFilled
                      ? 'border-2 border-amber-400 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'border border-white/10 bg-white/5 text-slate-500'
                  }`}
                >
                  {isFilled ? '●' : '—'}
                </div>
              );
            })}
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-4 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>رمز عبور مدیریت اشتباه است.</span>
            </div>
          )}

          {/* Numeric keypad for easy touch / mobile usage */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] my-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigitClick(digit)}
                className="h-11 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 font-mono text-sm font-black text-slate-200 transition-all cursor-pointer flex items-center justify-center"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-11 rounded-xl bg-white/5 hover:bg-rose-500/10 active:bg-rose-500/20 border border-white/5 text-xs font-bold text-slate-400 hover:text-rose-300 transition-all cursor-pointer flex items-center justify-center"
            >
              پاک کردن
            </button>
            <button
              type="button"
              onClick={() => handleDigitClick('0')}
              className="h-11 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 font-mono text-sm font-black text-slate-200 transition-all cursor-pointer flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="h-11 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 font-bold text-xs text-slate-950 transition-all cursor-pointer flex items-center justify-center"
            >
              تأیید
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 w-full flex justify-between items-center text-[11px] text-slate-500">
            <span>دسترسی اختصاصی ادمین</span>
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              انصراف (حالت تماشا)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
