/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Match, Player } from '../../types';
import { PlayerAvatar } from '../player/PlayerAvatar';
import { GroupBadge } from '../player/GroupBadge';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Swords, Calendar, Edit2, Play, Trophy } from 'lucide-react';

interface FixtureCardProps {
  match: Match;
  players: Player[];
  onEditScore: (match: Match) => void;
  matches?: Match[];
  onSwapMatches?: (matchIdA: string, matchIdB: string) => void;
}

export const FixtureCard: React.FC<FixtureCardProps> = ({
  match,
  players,
  onEditScore,
  matches = [],
  onSwapMatches
}) => {
  const p1 = players.find((p) => p.id === match.player1Id);
  const p2 = players.find((p) => p.id === match.player2Id);

  if (!p1 || !p2) return null;

  const isCompleted = match.status === 'completed';

  const getPointsAddedText = (p: number) => {
    if (p === 0) return '۰+';
    return `+${p}`;
  };

  const getStageTitle = () => {
    if (match.isPlayoff) {
      if (match.playoffStage === 'semi_final_1') return 'نیمه‌نهایی ۱';
      if (match.playoffStage === 'semi_final_2') return 'نیمه‌نهایی ۲';
      if (match.playoffStage === 'final') return 'فینال قهرمانی';
      if (match.playoffStage === 'third_place') return 'رده‌بندی سومی';
      return 'پلی‌آف';
    }
    return match.group ? `گروه ${match.group === 'A' ? 'الف' : 'ب'}` : 'دور گروهی';
  };

  return (
    <Card
      variant={isCompleted ? 'glass' : 'neon'}
      className="relative flex flex-col justify-between group hover:border-white/20 transition-all duration-300"
      padding="sm"
    >
      {/* Upper header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-300">
            روز {match.dayNumber} ({match.weekdayStr})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {match.group && <GroupBadge group={match.group} />}
          {isCompleted ? (
            <Badge variant="emerald">پایان یافته</Badge>
          ) : (
            <Badge variant="amber" className="animate-pulse">
              در انتظار بازی
            </Badge>
          )}
        </div>
      </div>

      {/* Main player versus grid */}
      <div className="grid grid-cols-7 items-center my-2 text-right">
        {/* Player 1 */}
        <div className="col-span-3 flex flex-col items-center text-center">
          <PlayerAvatar name={p1.name} size="sm" className="mb-2" />
          <span
            className={`text-xs font-black tracking-tight truncate max-w-[90px] ${
              match.winnerId === p1.id ? 'text-amber-300' : 'text-slate-200'
            }`}
          >
            {p1.name}
          </span>
          {isCompleted && (
            <span
              className={`text-[10px] font-bold font-mono mt-1 px-1.5 py-0.5 rounded ${
                match.p1Points >= 0.5
                  ? 'text-emerald-300 bg-emerald-500/10'
                  : 'text-slate-400 bg-white/5'
              }`}
            >
              (امتیاز {getPointsAddedText(match.p1Points)})
            </span>
          )}
        </div>

        {/* VS stats bar */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          <Swords className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          <span className="text-[9px] font-bold text-slate-500 tracking-wider mt-1">VS</span>
        </div>

        {/* Player 2 */}
        <div className="col-span-3 flex flex-col items-center text-center">
          <PlayerAvatar name={p2.name} size="sm" className="mb-2" />
          <span
            className={`text-xs font-black tracking-tight truncate max-w-[90px] ${
              match.winnerId === p2.id ? 'text-amber-300' : 'text-slate-200'
            }`}
          >
            {p2.name}
          </span>
          {isCompleted && (
            <span
              className={`text-[10px] font-bold font-mono mt-1 px-1.5 py-0.5 rounded ${
                match.p2Points >= 0.5
                  ? 'text-emerald-300 bg-emerald-500/10'
                  : 'text-slate-400 bg-white/5'
              }`}
            >
              (امتیاز {getPointsAddedText(match.p2Points)})
            </span>
          )}
        </div>
      </div>

      {/* Match details bar */}
      <div className="mt-3 p-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md flex justify-between items-center text-[10px]">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <span>رویداد:</span>
          <span className="text-slate-200 bg-white/5 px-2 py-0.5 rounded text-[9px]">
            {getStageTitle()}
          </span>
        </div>

        <div className="font-mono font-medium">
          {isCompleted ? (
            match.game1Result === 'DRAW' ? (
              <span className="text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded font-bold text-[9px]">
                تساوی (۰.۵ - ۰.۵)
              </span>
            ) : (
              <span className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded font-bold text-[9px]">
                برد {match.winnerId === p1.id ? p1.name : p2.name}
              </span>
            )
          ) : (
            <span className="text-slate-500 text-[9px]">تک‌بازی یک‌طرفه</span>
          )}
        </div>
      </div>

      {/* Date and Time Footer */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-white/5 pt-2">
        <span className="opacity-70">تاریخ برگزاری:</span>
        <span className="font-medium text-slate-300">{match.dateStr}</span>
      </div>

      {/* Action footer */}
      <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center gap-2">
        {/* Swap with another group match */}
        {!match.isPlayoff && onSwapMatches && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold shrink-0">جابه‌جایی:</span>
            <select
              value=""
              onChange={(e) => {
                const targetDayNumber = Number(e.target.value);
                if (targetDayNumber) {
                  const targetMatch = matches.find(
                    (m) => !m.isPlayoff && m.dayNumber === targetDayNumber
                  );
                  if (targetMatch) {
                    onSwapMatches(match.id, targetMatch.id);
                  }
                }
              }}
              className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-[10px] font-bold rounded-md px-1.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer transition-all max-w-[120px] truncate"
            >
              <option value="" disabled>
                با روز...
              </option>
              {matches
                .filter((m) => !m.isPlayoff && m.id !== match.id)
                .map((m) => {
                  const p1Other = players.find((p) => p.id === m.player1Id)?.name || '';
                  const p2Other = players.find((p) => p.id === m.player2Id)?.name || '';
                  return (
                    <option key={m.id} value={m.dayNumber}>
                      روز {m.dayNumber} ({p1Other} - {p2Other})
                    </option>
                  );
                })}
            </select>
          </div>
        )}

        <button
          onClick={() => onEditScore(match)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all duration-300 mr-auto ${
            isCompleted
              ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              : 'bg-white text-slate-950 hover:bg-slate-100 font-bold shadow-md'
          }`}
        >
          {isCompleted ? (
            <>
              <Edit2 className="w-3.5 h-3.5" />
              <span>ویرایش نتیجه</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-blue-600" />
              <span>ثبت نتیجه بازی</span>
            </>
          )}
        </button>
      </div>
    </Card>
  );
};
