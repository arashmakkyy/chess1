/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Match, Player } from '../../types';
import { PlayerAvatar } from '../player/PlayerAvatar';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Swords, Calendar, Play, Edit2, Trophy, Flame } from 'lucide-react';

interface PlayoffMatchCardProps {
  match: Match;
  players: Player[];
  title: string;
  subtitle?: string;
  isLocked?: boolean;
  lockMessage?: string;
  onEditScore?: (match: Match) => void;
  accentColor?: 'blue' | 'purple' | 'amber' | 'emerald';
}

export const PlayoffMatchCard: React.FC<PlayoffMatchCardProps> = ({
  match,
  players,
  title,
  subtitle,
  isLocked = false,
  lockMessage,
  onEditScore,
  accentColor = 'blue'
}) => {
  const p1 = players.find((p) => p.id === match.player1Id);
  const p2 = players.find((p) => p.id === match.player2Id);

  const isCompleted = match.status === 'completed';

  const getAccentBorder = () => {
    switch (accentColor) {
      case 'amber':
        return 'border-amber-500/30 hover:border-amber-500/50 bg-amber-500/5';
      case 'purple':
        return 'border-purple-500/30 hover:border-purple-500/50 bg-purple-500/5';
      case 'emerald':
        return 'border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/5';
      default:
        return 'border-blue-500/30 hover:border-blue-500/50 bg-blue-500/5';
    }
  };

  return (
    <Card
      variant="glass"
      padding="sm"
      className={`relative flex flex-col justify-between transition-all duration-300 ${getAccentBorder()} ${
        isCompleted ? 'shadow-[0_0_15px_rgba(255,255,255,0.03)]' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-100">{title}</span>
          {subtitle && <span className="text-[10px] text-slate-400 font-semibold">({subtitle})</span>}
        </div>

        {isLocked ? (
          <Badge variant="zinc">در انتظار نیمه‌نهایی</Badge>
        ) : isCompleted ? (
          <Badge variant="emerald">پایان یافته</Badge>
        ) : (
          <Badge variant="amber" className="animate-pulse">آماده مسابقه</Badge>
        )}
      </div>

      {isLocked ? (
        <div className="py-6 px-3 text-center bg-white/5 rounded-xl border border-dashed border-white/10 my-2">
          <Trophy className="w-6 h-6 text-slate-500 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-slate-400 font-semibold">{lockMessage || 'پس از پایان بازی‌های قبل مشخص می‌شود'}</p>
        </div>
      ) : (
        <>
          {/* Main versus row */}
          <div className="grid grid-cols-7 items-center my-3 text-center">
            {/* Player 1 */}
            <div className="col-span-3 flex flex-col items-center">
              <PlayerAvatar name={p1?.name || 'نامعلوم'} size="sm" className="mb-1.5" />
              <span
                className={`text-xs font-black truncate max-w-[90px] ${
                  isCompleted && match.winnerId === p1?.id
                    ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                    : 'text-slate-200'
                }`}
              >
                {p1?.name || 'نامعلوم'}
              </span>
              {isCompleted && match.winnerId === p1?.id && (
                <span className="text-[9px] font-bold text-amber-400 mt-0.5">👑 برنده صعودکننده</span>
              )}
            </div>

            {/* VS separator */}
            <div className="col-span-1 flex flex-col items-center">
              <Swords className="w-4 h-4 text-slate-400" />
              <span className="text-[9px] font-mono font-bold text-slate-500 mt-1">VS</span>
            </div>

            {/* Player 2 */}
            <div className="col-span-3 flex flex-col items-center">
              <PlayerAvatar name={p2?.name || 'نامعلوم'} size="sm" className="mb-1.5" />
              <span
                className={`text-xs font-black truncate max-w-[90px] ${
                  isCompleted && match.winnerId === p2?.id
                    ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                    : 'text-slate-200'
                }`}
              >
                {p2?.name || 'نامعلوم'}
              </span>
              {isCompleted && match.winnerId === p2?.id && (
                <span className="text-[9px] font-bold text-amber-400 mt-0.5">👑 برنده صعودکننده</span>
              )}
            </div>
          </div>

          {/* Match Score & Result */}
          <div className="mt-3 p-2 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1 text-slate-400 font-mono">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{match.weekdayStr} {match.dateStr}</span>
            </div>

            <div className="font-bold">
              {isCompleted ? (
                <span className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                  برنده: {match.winnerId === p1?.id ? p1?.name : p2?.name}
                </span>
              ) : (
                <span className="text-slate-400">تک‌بازی حذفی</span>
              )}
            </div>
          </div>

          {/* Action button */}
          {onEditScore && (
            <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-end">
              <button
                onClick={() => onEditScore(match)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    : 'bg-white text-slate-950 hover:bg-slate-100 shadow-md'
                }`}
              >
                {isCompleted ? (
                  <>
                    <Edit2 className="w-3 h-3" />
                    <span>ویرایش نتیجه</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-blue-600" />
                    <span>ثبت نتیجه بازی</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
