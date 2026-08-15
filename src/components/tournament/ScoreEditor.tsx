/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Match, Player, GameResult } from '../../types';
import { PlayerAvatar } from '../player/PlayerAvatar';
import { GroupBadge } from '../player/GroupBadge';
import { Swords, Check, X, ShieldAlert, Award, Sparkles } from 'lucide-react';

interface ScoreEditorProps {
  match: Match;
  players: Player[];
  onSave: (
    matchId: string,
    game1: GameResult,
    game2: GameResult,
    game3: GameResult,
    isPlayoff: boolean
  ) => void;
  onClose: () => void;
}

export const ScoreEditor: React.FC<ScoreEditorProps> = ({
  match,
  players,
  onSave,
  onClose
}) => {
  const p1 = players.find((p) => p.id === match.player1Id);
  const p2 = players.find((p) => p.id === match.player2Id);

  const [selectedResult, setSelectedResult] = useState<GameResult>(
    match.game1Result !== 'PENDING' ? match.game1Result : 'P1_WIN'
  );

  // For playoffs tie-breaker winner
  const [tiebreakerWinner, setTiebreakerWinner] = useState<'P1' | 'P2'>('P1');

  if (!p1 || !p2) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (match.isPlayoff && selectedResult === 'DRAW') {
      // In playoffs with a draw, game1 is DRAW and game2 is won by the tiebreaker winner
      const g2Result: GameResult = tiebreakerWinner === 'P1' ? 'P1_WIN' : 'P2_WIN';
      onSave(match.id, 'DRAW', g2Result, 'PENDING', match.isPlayoff);
    } else {
      onSave(match.id, selectedResult, 'PENDING', 'PENDING', match.isPlayoff);
    }

    onClose();
  };

  const getStageName = () => {
    if (match.isPlayoff) {
      if (match.playoffStage === 'semi_final_1') return 'نیمه‌نهایی ۱ (A1 vs B2)';
      if (match.playoffStage === 'semi_final_2') return 'نیمه‌نهایی ۲ (B1 vs A2)';
      if (match.playoffStage === 'final') return 'فینال قهرمانی لیگ';
      if (match.playoffStage === 'third_place') return 'دیدار رده‌بندی مقام سوم';
      return 'دیدار حذفی پلی‌آف';
    }
    return match.group ? `دور گروهی - گروه ${match.group === 'A' ? 'الف' : 'ب'}` : 'دور گروهی';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base md:text-lg font-black text-slate-100">
                ثبت نتیجه نبرد روز {match.dayNumber}
              </h3>
              {match.group && <GroupBadge group={match.group} />}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {getStageName()} | {match.weekdayStr} {match.dateStr}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Players Showcase */}
        <div className="grid grid-cols-7 items-center bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
          <div className="col-span-3 flex flex-col items-center text-center">
            <PlayerAvatar name={p1.name} size="md" className="mb-2" />
            <span className="text-xs md:text-sm font-extrabold text-slate-100 truncate max-w-[120px]">
              {p1.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">مهره سفید</span>
          </div>

          <div className="col-span-1 flex flex-col items-center justify-center">
            <Swords className="w-5 h-5 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-500 mt-1">VS</span>
          </div>

          <div className="col-span-3 flex flex-col items-center text-center">
            <PlayerAvatar name={p2.name} size="md" className="mb-2" />
            <span className="text-xs md:text-sm font-extrabold text-slate-100 truncate max-w-[120px]">
              {p2.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">مهره سیاه</span>
          </div>
        </div>

        {/* Form Selection */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 block">
              نتیجه بازی را مشخص کنید (تک‌بازی یک‌طرفه):
            </label>

            {/* Option 1: P1 WIN */}
            <button
              type="button"
              onClick={() => setSelectedResult('P1_WIN')}
              className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                selectedResult === 'P1_WIN'
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedResult === 'P1_WIN'
                      ? 'border-blue-400 bg-blue-500 text-white'
                      : 'border-slate-500'
                  }`}
                >
                  {selectedResult === 'P1_WIN' && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="font-bold text-xs md:text-sm">
                  برد {p1.name} (۱ - ۰)
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                +۱ امتیاز به {p1.name}
              </span>
            </button>

            {/* Option 2: DRAW */}
            <button
              type="button"
              onClick={() => setSelectedResult('DRAW')}
              className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                selectedResult === 'DRAW'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedResult === 'DRAW'
                      ? 'border-purple-400 bg-purple-500 text-white'
                      : 'border-slate-500'
                  }`}
                >
                  {selectedResult === 'DRAW' && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="font-bold text-xs md:text-sm">
                  تساوی (۰.۵ - ۰.۵)
                </span>
              </div>
              <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                ۰.۵ امتیاز به هر دو
              </span>
            </button>

            {/* Option 3: P2 WIN */}
            <button
              type="button"
              onClick={() => setSelectedResult('P2_WIN')}
              className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                selectedResult === 'P2_WIN'
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedResult === 'P2_WIN'
                      ? 'border-blue-400 bg-blue-500 text-white'
                      : 'border-slate-500'
                  }`}
                >
                  {selectedResult === 'P2_WIN' && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="font-bold text-xs md:text-sm">
                  برد {p2.name} (۰ - ۱)
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                +۱ امتیاز به {p2.name}
              </span>
            </button>
          </div>

          {/* Playoff Tie-Breaker Sub-Selection if Draw in Playoffs */}
          {match.isPlayoff && selectedResult === 'DRAW' && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl mt-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>در مرحله حذفی تساوی نهایی ممکن نیست. برنده دست تای‌بریک:</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTiebreakerWinner('P1')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    tiebreakerWinner === 'P1'
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md font-black'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  برد {p1.name} در بلیتس/آرماگدون
                </button>
                <button
                  type="button"
                  onClick={() => setTiebreakerWinner('P2')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    tiebreakerWinner === 'P2'
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md font-black'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  برد {p2.name} در بلیتس/آرماگدون
                </button>
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              انصراف
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-blue-600" />
              <span>ذخیره نتیجه رسمی</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
