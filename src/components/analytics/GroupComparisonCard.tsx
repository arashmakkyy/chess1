/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, Match } from '../../types';
import { Card } from '../common/Card';
import { Swords, Flame, Trophy } from 'lucide-react';

interface GroupComparisonCardProps {
  players: Player[];
  matches: Match[];
}

export const GroupComparisonCard: React.FC<GroupComparisonCardProps> = ({
  players,
  matches
}) => {
  const groupAPlayers = players.filter((p) => p.group === 'A');
  const groupBPlayers = players.filter((p) => p.group === 'B');

  const groupAMatches = matches.filter((m) => m.group === 'A');
  const groupBMatches = matches.filter((m) => m.group === 'B');

  const groupACompleted = groupAMatches.filter((m) => m.status === 'completed').length;
  const groupBCompleted = groupBMatches.filter((m) => m.status === 'completed').length;

  const topA = [...groupAPlayers].sort((a, b) => b.points - a.points)[0];
  const topB = [...groupBPlayers].sort((a, b) => b.points - a.points)[0];

  return (
    <Card variant="glass" className="w-full border-white/10" padding="md">
      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
        <Swords className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-black text-slate-100">
          مقایسه آماری گروه الف (A) و گروه ب (B)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Group A Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-blue-300">گروه الف (Group A)</span>
            <span className="text-[11px] text-slate-400 font-mono">۵ بازیکن</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block">پیشرفت بازی‌ها</span>
              <span className="text-sm font-bold text-blue-300 font-mono">
                {groupACompleted} از ۱۰
              </span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block">صدرنشین گروه</span>
              <span className="text-xs font-black text-slate-100 truncate max-w-[100px] inline-block mt-0.5">
                {topA?.name || '-'} ({topA?.points || 0}پ)
              </span>
            </div>
          </div>
        </div>

        {/* Group B Box */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-purple-300">گروه ب (Group B)</span>
            <span className="text-[11px] text-slate-400 font-mono">۵ بازیکن</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block">پیشرفت بازی‌ها</span>
              <span className="text-sm font-bold text-purple-300 font-mono">
                {groupBCompleted} از ۱۰
              </span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block">صدرنشین گروه</span>
              <span className="text-xs font-black text-slate-100 truncate max-w-[100px] inline-block mt-0.5">
                {topB?.name || '-'} ({topB?.points || 0}پ)
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
