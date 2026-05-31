/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../../types';
import { PlayerAvatar } from '../player/PlayerAvatar';
import { Card } from '../common/Card';
import { Trophy, ShieldAlert, Swords } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  // Sort players by: points (descending), then matchesWon (descending), then gamesWon (descending)
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.matchesWon !== a.matchesWon) {
      return b.matchesWon - a.matchesWon;
    }
    return b.gamesWon - a.gamesWon;
  });

  return (
    <Card variant="glass" className="w-full shadow-2xl relative overflow-hidden">
      {/* Decorative dark background grid line decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
            <Trophy className="w-5 h-5 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-100 tracking-tight">جدول رده‌بندی لیگ</h2>
            <p className="text-xs text-slate-400 mt-0.5">وضعیت زنده و امتیاز راند گروهی</p>
          </div>
        </div>
        <div className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 font-mono flex items-center gap-1.5 font-semibold">
          <Swords className="w-3.5 h-3.5 text-slate-400" />
          <span>مجموع بازی‌ها: ۱۲ فیکسچر</span>
        </div>
      </div>

      {/* Table List Layout for responsive design */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="text-slate-400 text-xs border-b border-white/10 pb-3 h-10 select-none">
              <th className="pb-3 pl-4 font-bold text-center w-14">رتبـه</th>
              <th className="pb-3 font-bold text-right pl-6">بازیکـن</th>
              <th className="pb-3 font-bold text-center w-20">کل بازی‌ها</th>
              <th className="pb-3 font-bold text-center w-20">برد مسابقه</th>
              <th className="pb-3 font-bold text-center w-20">باخت مسابقه</th>
              <th className="pb-3 font-bold text-center w-28 hidden md:table-cell">دست‌ها (ب/م/ب)</th>
              <th className="pb-3 font-bold text-center w-24">امتیـاز لیگ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedPlayers.map((player, index) => {
              const rank = index + 1;
              
              // Custom bg for rows
              const rowHighlight = rank === 1 
                ? 'bg-blue-500/5 hover:bg-blue-500/10' 
                : rank === 2 
                ? 'bg-white/5 hover:bg-white/10' 
                : 'hover:bg-white/5';

              const rankBadge = (r: number) => {
                switch (r) {
                  case 1:
                    return <span className="text-base">🥇</span>;
                  case 2:
                    return <span className="text-base">🥈</span>;
                  case 3:
                    return <span className="text-base">🥉</span>;
                  default:
                    return <span className="font-mono text-slate-500 font-bold">۴</span>;
                }
              };

              return (
                <tr key={player.id} className={`transition-all duration-200 h-16 ${rowHighlight}`}>
                  {/* Rank */}
                  <td className="text-center pl-4">
                    <div className="flex items-center justify-center font-mono">
                      {rankBadge(rank)}
                    </div>
                  </td>

                  {/* Player info with Piece Icon */}
                  <td className="pl-6">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={player.name} size="sm" />
                      <div>
                        <span className="font-extrabold text-slate-100 text-sm block md:text-base">{player.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block md:hidden">
                          دست‌ها: {player.gamesWon}/{player.gamesDrew}/{player.gamesLost}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Played Matches */}
                  <td className="text-center">
                    <span className="font-mono text-slate-300 font-semibold text-sm">{player.matchesPlayed}</span>
                  </td>

                  {/* Won Matches */}
                  <td className="text-center">
                    <span className="font-mono text-emerald-400 font-bold text-sm bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">{player.matchesWon}</span>
                  </td>

                  {/* Lost Matches */}
                  <td className="text-center">
                    <span className="font-mono text-rose-400 font-bold text-sm bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">{player.matchesLost}</span>
                  </td>

                  {/* Hand Ledger (W/D/L) - Hidden on mobile */}
                  <td className="text-center hidden md:table-cell">
                    <div className="font-mono text-xs text-slate-300 bg-white/5 inline-flex gap-1.5 px-2.5 py-1 rounded-xl border border-white/10 font-semibold">
                      <span className="text-emerald-400">{player.gamesWon}ب</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-300">{player.gamesDrew}م</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-rose-400">{player.gamesLost}ب</span>
                    </div>
                  </td>

                  {/* Points */}
                  <td className="text-center">
                    <div className="font-mono text-blue-300 font-extrabold text-base filter drop-shadow-[0_0_12px_rgba(59,130,246,0.2)] bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-xl inline-block">
                      {player.points}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Point Rules Footer for information */}
      <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-2 justify-between items-center text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
          <span>قانون امتیازدهی مسابقات:</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <span>🏆 برد تک‌بازی: <strong className="text-emerald-400 font-semibold">۱ امتیاز</strong></span>
          <span>🤝 مساوی: <strong className="text-indigo-300 font-semibold">۰.۵ امتیاز</strong></span>
          <span>💀 باخت تک‌بازی: <strong className="text-slate-200 font-semibold">۰ امتیاز</strong></span>
        </div>
      </div>
    </Card>
  );
};
