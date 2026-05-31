/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Match, Player, GameResult } from '../../types';
import { PlayerAvatar } from '../player/PlayerAvatar';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { X, Calendar, Flame, Swords, ShieldAlert, Check } from 'lucide-react';

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
  const p1 = players.find(p => p.id === match.player1Id);
  const p2 = players.find(p => p.id === match.player2Id);

  // States for game scores
  const [g1, setG1] = useState<GameResult>(match.game1Result);
  const [g2, setG2] = useState<GameResult>(match.game2Result);
  const [g3, setG3] = useState<GameResult>(match.game3Result);

  // Auto-reset when match changes
  useEffect(() => {
    setG1(match.game1Result);
    setG2(match.game2Result);
    setG3(match.game3Result);
  }, [match]);

  if (!p1 || !p2) return null;

  // Let's calculate if Game 3 is unlocked/required based on Game 1 and Game 2 results
  const checkTieBreakerRequired = () => {
    if (g1 === 'PENDING' || g2 === 'PENDING') return false;

    // Cases for tie-breaker:
    // Case 1: Game 1 DRAW and Game 2 DRAW => tie
    if (g1 === 'DRAW' && g2 === 'DRAW') return true;
    
    // Case 2: P1 wins one, P2 wins one => tie (1-1)
    if (
      (g1 === 'P1_WIN' && g2 === 'P2_WIN') ||
      (g1 === 'P2_WIN' && g2 === 'P1_WIN')
    ) {
      return true;
    }

    return false;
  };

  const isTieBreaker = checkTieBreakerRequired();

  // If tie-breaker is NOT required, set g3 back to PENDING automatically
  useEffect(() => {
    if (!isTieBreaker) {
      setG3('PENDING');
    }
  }, [isTieBreaker]);

  // Handle Save
  const handleSaveClick = () => {
    if (match.isPlayoff) {
      if (g1 === 'PENDING' || g2 === 'PENDING') {
        alert('لطفاً امتیاز تمام راندهای اصلی را ثبت کنید.');
        return;
      }
      if (isTieBreaker && g3 === 'PENDING') {
        alert('بازی مساوی شده است! ثبت نتیجه دست سوم (بازی حذفی/تای‌بریک) الزامی است.');
        return;
      }
      onSave(match.id, g1, g2, isTieBreaker ? g3 : 'PENDING', true);
    } else {
      if (g1 === 'PENDING') {
        alert('لطفاً نتیجه بازی را انتخاب کنید.');
        return;
      }
      if (match.matchType === 'tiebreaker' && g1 === 'DRAW') {
        alert('مسابقه تساوی‌شکن اضطراری الزامی است که برنده داشته باشد تا بن‌بست شکسته شود!');
        return;
      }
      onSave(match.id, g1, 'PENDING', 'PENDING', false);
    }
  };

  // Helper score badges
  const getP1Score = () => {
    if (match.isPlayoff) {
      let pts = 0;
      if (g1 === 'P1_WIN') pts += 1;
      if (g1 === 'DRAW') pts += 0.5;
      if (g2 === 'P1_WIN') pts += 1;
      if (g2 === 'DRAW') pts += 0.5;
      if (isTieBreaker && g3 === 'P1_WIN') pts += 1;
      return pts;
    } else {
      if (g1 === 'P1_WIN') return 1;
      if (g1 === 'DRAW') return 0.5;
      return 0;
    }
  };

  const getP2Score = () => {
    if (match.isPlayoff) {
      let pts = 0;
      if (g1 === 'P2_WIN') pts += 1;
      if (g1 === 'DRAW') pts += 0.5;
      if (g2 === 'P2_WIN') pts += 1;
      if (g2 === 'DRAW') pts += 0.5;
      if (isTieBreaker && g3 === 'P2_WIN') pts += 1;
      return pts;
    } else {
      if (g1 === 'P2_WIN') return 1;
      if (g1 === 'DRAW') return 0.5;
      return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all">
      <Card
        variant="glow-gold"
        padding="none"
        className="relative w-full max-w-xl overflow-hidden border border-amber-500/30 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header decoration */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-indigo-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Form Body */}
        <div className="p-6">
          {/* Header Info */}
          <div className="flex items-center gap-3 border-b border-zinc-900 pb-5 mb-6 text-right">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                  بازی روز {match.dayNumber} - {match.weekdayStr}
                </span>
                {match.isPlayoff && (
                  <span className="text-xs text-fuchsia-400 font-bold bg-fuchsia-500/10 px-2 py-0.5 rounded-full tracking-wider">
                    {match.playoffType === 'final' ? 'مسابقه فینال' : 'مسابقه رده‌بندی سومی/چهارمی'}
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-zinc-100 mt-1">
                ثبت و ویرایش نتایج مسابقه شطرنج
              </h3>
            </div>
          </div>

          {/* Versus Header */}
          <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-4 mb-6">
            <div className="flex flex-col items-center flex-1 text-center">
              <PlayerAvatar name={p1.name} size="md" className="mb-2" />
              <span className="text-sm font-extrabold text-zinc-200">{p1.name}</span>
              <span className="text-xs text-zinc-500 font-bold font-mono mt-1">سفید / سیاه</span>
            </div>

            <div className="flex flex-col items-center px-4">
              <span className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" />
                <span>نتیجه بازی</span>
              </span>
              <div className="flex items-center gap-3 mt-2 font-mono text-2xl font-black">
                <span className="text-zinc-200">{getP1Score()}</span>
                <span className="text-zinc-600 font-normal">:</span>
                <span className="text-zinc-200">{getP2Score()}</span>
              </div>
            </div>

            <div className="flex flex-col items-center flex-1 text-center">
              <PlayerAvatar name={p2.name} size="md" className="mb-2" />
              <span className="text-sm font-extrabold text-zinc-200">{p2.name}</span>
              <span className="text-xs text-zinc-500 font-bold font-mono mt-1">سیاه / سفید</span>
            </div>
          </div>

          {/* Individual Games */}
          <div className="space-y-4">
            {!match.isPlayoff ? (
              /* Group stage single-game selector */
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-zinc-300 font-bold">
                    {match.matchType === 'tiebreaker' ? 'نتیجه تک‌بازی تساوی‌شکن اضطراری' : 'نتیجه تک‌بازی مسابقه'}
                  </span>
                  {g1 !== 'PENDING' && <Check className="w-4 h-4 text-emerald-500 font-bold" />}
                </div>
                
                {match.matchType === 'tiebreaker' && (
                  <p className="text-[11px] text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2.5 py-2 rounded-lg leading-relaxed mb-4 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                    <span>همچنان که این بازی تساوی‌شکن است، باید حتماً یکی از دو بازیکن برنده شوند تا بن‌بست شکسته شود.</span>
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setG1('P1_WIN')}
                    className={`py-3 px-3 text-xs font-bold rounded-xl cursor-pointer transition-all border ${
                      g1 === 'P1_WIN'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    برد {p1.name}
                  </button>
                  {match.matchType !== 'tiebreaker' ? (
                    <button
                      onClick={() => setG1('DRAW')}
                      className={`py-3 px-3 text-xs font-bold rounded-xl cursor-pointer transition-all border ${
                        g1 === 'DRAW'
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      مساوی شد
                    </button>
                  ) : (
                    <div className="py-3 px-3 text-xs font-mono font-medium rounded-xl border border-dashed border-zinc-800 text-zinc-650 bg-zinc-950 flex items-center justify-center">
                      محدودیت تساوی
                    </div>
                  )}
                  <button
                    onClick={() => setG1('P2_WIN')}
                    className={`py-3 px-3 text-xs font-bold rounded-xl cursor-pointer transition-all border ${
                      g1 === 'P2_WIN'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    برد {p2.name}
                  </button>
                </div>
              </div>
            ) : (
              /* Playoff series best of 3 selectors */
              <>
                {/* Game 1 Selector */}
                <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs text-zinc-400 font-bold">دست اول بازی (اصلی)</span>
                    {g1 !== 'PENDING' && <Check className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setG1('P1_WIN')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all border ${
                        g1 === 'P1_WIN'
                          ? 'bg-amber-500/25 border-amber-500 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      برد {p1.name}
                    </button>
                    <button
                      onClick={() => setG1('DRAW')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all border ${
                        g1 === 'DRAW'
                          ? 'bg-indigo-500/25 border-indigo-500 text-indigo-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      مساوی دست
                    </button>
                    <button
                      onClick={() => setG1('P2_WIN')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all border ${
                        g1 === 'P2_WIN'
                          ? 'bg-amber-500/25 border-amber-500 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      برد {p2.name}
                    </button>
                  </div>
                </div>

                {/* Game 2 Selector */}
                <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs text-zinc-400 font-bold">دست دوم بازی (اصلی)</span>
                    {g2 !== 'PENDING' && <Check className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setG2('P1_WIN')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all border ${
                        g2 === 'P1_WIN'
                          ? 'bg-amber-500/25 border-amber-500 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      برد {p1.name}
                    </button>
                    <button
                      onClick={() => setG2('DRAW')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all border ${
                        g2 === 'DRAW'
                          ? 'bg-indigo-500/25 border-indigo-500 text-indigo-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      مساوی دست
                    </button>
                    <button
                      onClick={() => setG2('P2_WIN')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all border ${
                        g2 === 'P2_WIN'
                          ? 'bg-amber-500/25 border-amber-500 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      برد {p2.name}
                    </button>
                  </div>
                </div>

                {/* Game 3 Selector (Unlocked ONLY on Ties) */}
                {isTieBreaker && (
                  <div className="bg-amber-500/5 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)] rounded-xl p-4 relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                      <span className="text-xs text-amber-400 font-bold">دست سوم: راند سرنوشت‌ساز (تای‌بریک ویژه)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                      امتیاز کل دو دست اصلی مساوی شده است. طبق قوانین، دست سوم برای مشخص کردن برنده نهایی فیکسچر بازی می‌شود و این دست نباید مساوی داشته باشد.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setG3('P1_WIN')}
                        className={`py-3 px-4 text-xs font-bold rounded-xl cursor-pointer transition-all border ${
                          g3 === 'P1_WIN'
                            ? 'bg-amber-500 hover:bg-amber-400 border-amber-400 text-black shadow-md shadow-amber-500/10'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        قهرمانی نهایی: {p1.name}
                      </button>
                      <button
                        onClick={() => setG3('P2_WIN')}
                        className={`py-3 px-4 text-xs font-bold rounded-xl cursor-pointer transition-all border ${
                          g3 === 'P2_WIN'
                            ? 'bg-amber-500 hover:bg-amber-400 border-amber-400 text-black shadow-md shadow-amber-500/10'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        قهرمانی نهایی: {p2.name}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Notification Info */}
          <div className="mt-6 flex items-start gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-900">
            <ShieldAlert className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              با ذخیره این جدول، مابقی آمارها از جمله تفاضل بردهای انفرادی، درصد برد بازیکنان و جدول نمودارهای پیشرفته اتوماتیک آپدیت و در حافظه مرورگر شما بازنویسی می‌شوند.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="glow"
              fullWidth
              onClick={handleSaveClick}
              disabled={
                match.isPlayoff
                  ? g1 === 'PENDING' || g2 === 'PENDING' || (isTieBreaker && g3 === 'PENDING')
                  : g1 === 'PENDING'
              }
            >
              ذخیره تغییرات نتایج
            </Button>
            <Button variant="outline" onClick={onClose}>
              انصراف
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
