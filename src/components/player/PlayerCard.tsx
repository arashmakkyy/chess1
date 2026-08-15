/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../../types';
import { PlayerAvatar } from './PlayerAvatar';
import { GroupBadge } from './GroupBadge';
import { Card } from '../common/Card';
import { Award, Target } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  rank: number;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, rank }) => {
  const winRate =
    player.matchesPlayed > 0
      ? Math.round((player.matchesWon / player.matchesPlayed) * 100)
      : 0;

  const getRankStyle = (r: number) => {
    switch (r) {
      case 1:
        return 'border-blue-500/40 shadow-[0_0_20px_-3px_rgba(59,130,246,0.2)] bg-white/10 backdrop-blur-xl';
      case 2:
        return 'border-white/20 shadow-[0_0_15px_-3px_rgba(255,255,255,0.05)] bg-white/5 backdrop-blur-xl';
      case 3:
        return 'border-white/15 bg-white/5 backdrop-blur-xl';
      default:
        return 'border-white/10 bg-white/5 backdrop-blur-xl';
    }
  };

  const getRankBadge = (r: number) => {
    switch (r) {
      case 1:
        return <span className="text-xl">🥇</span>;
      case 2:
        return <span className="text-xl">🥈</span>;
      case 3:
        return <span className="text-xl">🥉</span>;
      default:
        return <span className="font-mono text-slate-400 font-bold">#{r}</span>;
    }
  };

  return (
    <Card className={`relative group hover:scale-[1.02] ${getRankStyle(rank)}`}>
      {/* Rank floating badge */}
      <div className="absolute top-4 left-4 flex items-center gap-1">
        {getRankBadge(rank)}
      </div>

      {/* Group badge */}
      <div className="absolute top-4 right-4">
        <GroupBadge group={player.group} />
      </div>

      <div className="flex flex-col items-center pt-5">
        <PlayerAvatar name={player.name} size="lg" className="mb-4" />

        <h3 className="text-base font-bold text-slate-100 mb-1 group-hover:text-blue-300 transition-colors duration-300 text-center">
          {player.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-5 font-semibold">
          <Award className="w-3.5 h-3.5 text-blue-400" />
          <span>امتیاز گروه: </span>
          <span className="text-blue-300 font-bold font-mono text-sm">{player.points}</span>
        </div>

        {/* Mini stats grid */}
        <div className="grid grid-cols-3 gap-2 w-full bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm text-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">برد</span>
            <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              {player.matchesWon}
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-white/10">
            <span className="text-[10px] text-slate-400 font-medium">باخت</span>
            <span className="text-sm font-bold text-rose-400 font-mono mt-0.5">
              {player.matchesLost}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">درصد برد</span>
            <span className="text-sm font-bold text-slate-200 font-mono mt-0.5">{winRate}%</span>
          </div>
        </div>

        {/* Detailed games ledger */}
        <div className="mt-4 w-full flex justify-between items-center text-xs text-slate-400 font-semibold px-1">
          <div className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-slate-400" />
            <span>کل بازی‌ها: {player.matchesPlayed}</span>
          </div>
          <div className="flex gap-2 font-mono text-[11px]">
            <span className="text-emerald-400">{player.gamesWon}ب</span>
            <span className="text-slate-400">{player.gamesDrew}م</span>
            <span className="text-rose-400">{player.gamesLost}ش</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
