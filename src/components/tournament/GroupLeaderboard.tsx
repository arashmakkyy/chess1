/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, GroupIdentifier } from '../../types';
import { PlayerAvatar } from '../player/PlayerAvatar';
import { Card } from '../common/Card';
import { Trophy, Swords, Sparkles, CheckCircle2 } from 'lucide-react';

interface GroupLeaderboardProps {
  group: GroupIdentifier;
  players: Player[];
  title?: string;
}

export const GroupLeaderboard: React.FC<GroupLeaderboardProps> = ({
  group,
  players,
  title
}) => {
  const isA = group === 'A';
  const groupPlayers = players.filter((p) => p.group === group);

  // Sort players by: points (descending), then matchesWon (descending), then gamesWon (descending)
  const sortedPlayers = [...groupPlayers].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.matchesWon !== a.matchesWon) {
      return b.matchesWon - a.matchesWon;
    }
    return b.gamesWon - a.gamesWon;
  });

  const groupTitle = title || (isA ? 'جدول رده‌بندی گروه الف (Group A)' : 'جدول رده‌بندی گروه ب (Group B)');

  return (
    <Card
      variant="glass"
      className={`w-full shadow-2xl relative overflow-hidden border ${
        isA ? 'border-blue-500/20' : 'border-purple-500/20'
      }`}
    >
      {/* Decorative ambient background */}
      <div
        className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          isA ? 'bg-blue-500/10' : 'bg-purple-500/10'
        }`}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border text-slate-100 ${
              isA
                ? 'bg-blue-500/15 border-blue-500/30'
                : 'bg-purple-500/15 border-purple-500/30'
            }`}
          >
            <Trophy className="w-5 h-5 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-extrabold text-slate-100 tracking-tight">
              {groupTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">۲ نفر اول راهی نیمه‌نهایی ضربدری می‌شوند</p>
          </div>
        </div>
        <div className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 font-mono flex items-center gap-1.5 font-semibold">
          <Swords className="w-3.5 h-3.5 text-slate-400" />
          <span>۱۰ بازی در گروه</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="text-slate-400 text-xs border-b border-white/10 pb-3 h-10 select-none">
              <th className="pb-3 pl-3 font-bold text-center w-12">رتبه</th>
              <th className="pb-3 font-bold text-right pl-4">بازیکن</th>
              <th className="pb-3 font-bold text-center w-16">بازی</th>
              <th className="pb-3 font-bold text-center w-16">برد</th>
              <th className="pb-3 font-bold text-center w-16">باخت</th>
              <th className="pb-3 font-bold text-center w-24 hidden md:table-cell">دست‌ها (ب/م/ش)</th>
              <th className="pb-3 font-bold text-center w-20">امتیاز</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedPlayers.map((player, index) => {
              const rank = index + 1;
              const isQualified = rank <= 2;

              return (
                <tr
                  key={player.id}
                  className={`transition-all duration-200 h-16 ${
                    isQualified
                      ? isA
                        ? 'bg-blue-500/5 hover:bg-blue-500/10'
                        : 'bg-purple-500/5 hover:bg-purple-500/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Rank */}
                  <td className="text-center pl-3">
                    <div className="flex items-center justify-center font-mono">
                      {rank === 1 ? (
                        <span className="text-base">🥇</span>
                      ) : rank === 2 ? (
                        <span className="text-base">🥈</span>
                      ) : rank === 3 ? (
                        <span className="text-base">🥉</span>
                      ) : (
                        <span className="font-mono text-slate-500 font-bold">{rank}</span>
                      )}
                    </div>
                  </td>

                  {/* Player info */}
                  <td className="pl-4">
                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar name={player.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-100 text-xs md:text-sm">
                            {player.name}
                          </span>
                          {isQualified && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span className="hidden sm:inline">صعود به نیمه‌نهایی</span>
                              <span className="sm:hidden">صعود</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block md:hidden">
                          دست‌ها: {player.gamesWon}ب/{player.gamesDrew}م/{player.gamesLost}ش
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Played */}
                  <td className="text-center">
                    <span className="font-mono text-slate-300 font-semibold text-xs md:text-sm">
                      {player.matchesPlayed}
                    </span>
                  </td>

                  {/* Won */}
                  <td className="text-center">
                    <span className="font-mono text-emerald-400 font-bold text-xs md:text-sm bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      {player.matchesWon}
                    </span>
                  </td>

                  {/* Lost */}
                  <td className="text-center">
                    <span className="font-mono text-rose-400 font-bold text-xs md:text-sm bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                      {player.matchesLost}
                    </span>
                  </td>

                  {/* W/D/L Hand */}
                  <td className="text-center hidden md:table-cell">
                    <div className="font-mono text-[11px] text-slate-300 bg-white/5 inline-flex gap-1.5 px-2.5 py-1 rounded-xl border border-white/10 font-semibold">
                      <span className="text-emerald-400">{player.gamesWon}ب</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-300">{player.gamesDrew}م</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-rose-400">{player.gamesLost}ش</span>
                    </div>
                  </td>

                  {/* Points */}
                  <td className="text-center">
                    <div
                      className={`font-mono font-extrabold text-sm md:text-base border px-2.5 py-1 rounded-xl inline-block ${
                        isA
                          ? 'text-blue-300 bg-blue-500/10 border-blue-500/20'
                          : 'text-purple-300 bg-purple-500/10 border-purple-500/20'
                      }`}
                    >
                      {player.points}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>شرط صعود: کسب رتبه اول یا دوم در گروه</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">برد: ۱ امتیاز | مساوی: ۰.۵ | باخت: ۰</span>
      </div>
    </Card>
  );
};
