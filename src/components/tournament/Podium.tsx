/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Match, Player } from '../../types';
import { PlayerAvatar } from '../player/PlayerAvatar';
import { Card } from '../common/Card';
import confetti from 'canvas-confetti';
import { Trophy, Star, ShieldAlert, Award } from 'lucide-react';

interface PodiumProps {
  players: Player[];
  finalMatch: Match | null;
  thirdPlaceMatch: Match | null;
}

export const Podium: React.FC<PodiumProps> = ({
  players,
  finalMatch,
  thirdPlaceMatch
}) => {
  const isPlayoffsCompleted = 
    finalMatch?.status === 'completed' && 
    thirdPlaceMatch?.status === 'completed';

  // Trigger confetti when playoff ends
  useEffect(() => {
    if (isPlayoffsCompleted) {
      // Fire confetti multiple times for visual bliss
      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isPlayoffsCompleted]);

  if (!isPlayoffsCompleted || !finalMatch || !thirdPlaceMatch) return null;

  // Calculate final standing positions
  const goldPlayerId = finalMatch.winnerId;
  const silverPlayerId = finalMatch.player1Id === goldPlayerId ? finalMatch.player2Id : finalMatch.player1Id;
  
  const bronzePlayerId = thirdPlaceMatch.winnerId;
  const copperPlayerId = thirdPlaceMatch.player1Id === bronzePlayerId ? thirdPlaceMatch.player2Id : thirdPlaceMatch.player1Id;

  const gold = players.find(p => p.id === goldPlayerId);
  const silver = players.find(p => p.id === silverPlayerId);
  const bronze = players.find(p => p.id === bronzePlayerId);
  const copper = players.find(p => p.id === copperPlayerId);

  return (
    <Card variant="glow-gold" className="w-full relative overflow-hidden bg-gradient-to-b from-amber-500/5 to-zinc-950 p-8 text-center border-amber-500/30">
      {/* Visual background auras */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center max-w-2xl mx-auto">
        <Trophy className="w-16 h-16 text-amber-500 mb-2 filter drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-bounce" />
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 tracking-tight uppercase">
          قهرمان نهایی مشخص شد!
        </h2>
        <p className="text-xs text-zinc-400 mt-1 mb-8 max-w-sm">
          پایان موفقیت‌آمیز دور نهایی لیگ؛ تبریک ویژه به تمام شطرنج‌بازان افتخارآفرین جام
        </p>

        {/* Podium Columns */}
        <div className="grid grid-cols-3 gap-4 items-end w-full max-w-lg mx-auto bg-zinc-950/40 border border-zinc-900 rounded-3xl p-6 mb-8 text-center">
          {/* Silver - 2nd place (Left side) */}
          {silver && (
            <div className="flex flex-col items-center group">
              <div className="relative mb-3">
                <PlayerAvatar name={silver.name} size="sm" />
                <span className="absolute -top-3 -right-2 bg-zinc-800 text-zinc-300 font-bold border border-zinc-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono">
                  ۲
                </span>
              </div>
              <span className="text-xs font-black text-zinc-300 truncate max-w-[80px]">
                {silver.name}
              </span>
              <div className="w-full bg-zinc-800/50 hover:bg-zinc-800/80 border-t border-zinc-700/50 rounded-xl mt-3 h-20 flex flex-col justify-center items-center transition-all duration-300">
                <span className="text-lg">🥈</span>
                <span className="text-[10px] text-zinc-400 font-extrabold mt-1">نایب قهرمان</span>
              </div>
            </div>
          )}

          {/* Gold - 1st place (Center - taller) */}
          {gold && (
            <div className="flex flex-col items-center group transform scale-110 -translate-y-2 z-10">
              <div className="relative mb-3">
                {/* Floating Crown above Avatar */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl text-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse">
                  👑
                </div>
                <PlayerAvatar name={gold.name} size="md" className="border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                <span className="absolute -top-3 -right-2 bg-amber-500 text-black font-black w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono">
                  ۱
                </span>
              </div>
              <span className="text-sm font-black text-amber-400 truncate max-w-[100px] filter drop-shadow-[0_0_6px_rgba(245,158,11,0.2)]">
                {gold.name}
              </span>
              <div className="w-full bg-gradient-to-b from-amber-500/25 to-amber-950/20 hover:from-amber-500/35 border-t-2 border-amber-400/80 rounded-xl mt-3 h-28 flex flex-col justify-center items-center shadow-[0_0_20px_rgba(245,158,11,0.08)] transition-all duration-300">
                <span className="text-2xl animate-spin-slow">🥇</span>
                <span className="text-[11px] text-amber-300 font-black mt-1">قهــرمان</span>
              </div>
            </div>
          )}

          {/* Bronze - 3rd place (Right side) */}
          {bronze && (
            <div className="flex flex-col items-center group">
              <div className="relative mb-3">
                <PlayerAvatar name={bronze.name} size="sm" />
                <span className="absolute -top-3 -right-2 bg-zinc-900 text-amber-700 font-bold border border-amber-800/50 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono">
                  ۳
                </span>
              </div>
              <span className="text-xs font-black text-zinc-300 truncate max-w-[80px]">
                {bronze.name}
              </span>
              <div className="w-full bg-amber-900/10 hover:bg-amber-900/20 border-t border-amber-900/30 rounded-xl mt-3 h-16 flex flex-col justify-center items-center transition-all duration-300">
                <span className="text-lg">🥉</span>
                <span className="text-[10px] text-amber-600 font-extrabold mt-1">مقام سوم</span>
              </div>
            </div>
          )}
        </div>

        {/* 4th place credit line */}
        {copper && (
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-900 px-4 py-2 rounded-2xl text-xs text-zinc-400 font-semibold mb-2">
            <Award className="w-4 h-4 text-zinc-500" />
            <span>مقام چهارم شجاع لیگ:</span>
            <span className="text-zinc-200 font-black">{copper.name}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
