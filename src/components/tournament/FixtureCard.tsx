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
import { Swords, Calendar, Edit2, Play, Flame } from 'lucide-react';

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
  const p1 = players.find(p => p.id === match.player1Id);
  const p2 = players.find(p => p.id === match.player2Id);

  if (!p1 || !p2) return null;

  // Compute game score badges text style
  const getGameBadge = (res: string, forPlayer: 'P1' | 'P2') => {
    if (res === 'PENDING') return 'bg-white/5 border border-white/5 text-slate-500 font-normal';
    if (res === 'DRAW') return 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold';
    
    if (forPlayer === 'P1') {
      return res === 'P1_WIN' 
        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold' 
        : 'bg-rose-500/20 border border-rose-500/30 text-rose-300 font-normal';
    } else {
      return res === 'P2_WIN' 
        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold' 
        : 'bg-rose-500/20 border border-rose-500/30 text-rose-300 font-normal';
    }
  };

  const getPointsAddedText = (p: number) => {
    if (p === 0) return '۰+';
    return `+${p}`;
  };

  const getMatchTypeLabel = () => {
    if (match.isPlayoff) {
      return match.playoffType === 'final' ? 'مسابقه فینال' : 'رده‌بندی سومی';
    }
    if (match.matchType === 'went') return 'بازی رفت';
    if (match.matchType === 'returned') return 'بازی برگشت';
    if (match.matchType === 'tiebreaker') return 'تساوی‌شکن اضطراری';
    return 'دور گروهی';
  };

  return (
    <Card 
      variant={match.status === 'completed' ? 'glass' : 'neon'} 
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
        
        {match.status === 'completed' ? (
          <Badge variant="emerald">پایان یافته</Badge>
        ) : (
          <Badge variant="amber" className="animate-pulse">در انتظار بازی</Badge>
        )}
      </div>

      {/* Main player versus grid */}
      <div className="grid grid-cols-7 items-center my-2 text-right">
        {/* Player 1 details */}
        <div className="col-span-3 flex flex-col items-center text-center">
          <PlayerAvatar name={p1.name} size="sm" className="mb-2" />
          <span className={`text-xs font-black tracking-tight ${match.winnerId === p1.id ? 'text-amber-300' : 'text-slate-200'}`}>
            {p1.name}
          </span>
          {match.status === 'completed' && (
            <span className={`text-[10px] font-bold font-mono mt-1 px-1.5 py-0.5 rounded ${match.p1Points >= 0.5 ? 'text-emerald-300 bg-emerald-500/5' : 'text-slate-400 bg-white/5'}`}>
              (امتیاز {getPointsAddedText(match.p1Points)})
            </span>
          )}
        </div>

        {/* VS stats bar */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          <Swords className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          <span className="text-[9px] font-bold text-slate-500 tracking-wider mt-1">VS</span>
        </div>

        {/* Player 2 details */}
        <div className="col-span-3 flex flex-col items-center text-center">
          <PlayerAvatar name={p2.name} size="sm" className="mb-2" />
          <span className={`text-xs font-black tracking-tight ${match.winnerId === p2.id ? 'text-amber-300' : 'text-slate-200'}`}>
            {p2.name}
          </span>
          {match.status === 'completed' && (
            <span className={`text-[10px] font-bold font-mono mt-1 px-1.5 py-0.5 rounded ${match.p2Points >= 0.5 ? 'text-emerald-300 bg-emerald-500/5' : 'text-slate-400 bg-white/5'}`}>
              (امتیاز {getPointsAddedText(match.p2Points)})
            </span>
          )}
        </div>
      </div>

      {/* Leg scores showcase */}
      <div className="mt-4 p-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md flex justify-between items-center text-[10px]">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <span>رویداد:</span>
          {match.matchType === 'tiebreaker' ? (
            <span className="text-amber-400 flex items-center gap-0.5 bg-amber-500/15 px-1.5 py-0.5 rounded text-[9px] font-black border border-amber-500/20">
              <Flame className="w-2.5 h-2.5 animate-pulse text-amber-500" />
              <span>{getMatchTypeLabel()}</span>
            </span>
          ) : (
            <span className="text-slate-200 bg-white/5 px-1.5 py-0.5 rounded text-[9px]">
              {getMatchTypeLabel()}
            </span>
          )}
        </div>

        {match.isPlayoff ? (
          <div className="flex gap-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${getGameBadge(match.game1Result, 'P1')}`}>
              ۱
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${getGameBadge(match.game2Result, 'P1')}`}>
              ۲
            </span>
            {(match.game3Result !== 'PENDING' || (match.game1Result !== 'PENDING' && match.game2Result !== 'PENDING' && match.game3Result === 'PENDING' && (
              (match.game1Result === 'DRAW' && match.game2Result === 'DRAW') ||
              (match.game1Result === 'P1_WIN' && match.game2Result === 'P2_WIN') ||
              (match.game1Result === 'P2_WIN' && match.game2Result === 'P1_WIN')
            ))) && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono flex items-center gap-0.5 ${getGameBadge(match.game3Result, 'P1')}`}>
                <Flame className="w-2.5 h-2.5" /> ۳
              </span>
            )}
          </div>
        ) : (
          <div className="font-mono font-medium">
            {match.status === 'completed' ? (
              match.game1Result === 'DRAW' ? (
                <span className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded font-bold text-[9px]">مساوی شد</span>
              ) : (
                <span className="text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold text-[9px]">
                  برنده: {match.winnerId === p1.id ? p1.name : p2.name}
                </span>
              )
            ) : (
              <span className="text-slate-500 text-[9px]">برگزار نشده</span>
            )}
          </div>
        )}
      </div>

      {/* Date and Time Footer */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-white/5 pt-2">
        <span className="opacity-70">زمان برگزاری:</span>
        <span className="font-medium text-slate-300">{match.dateStr}</span>
      </div>

      {/* Button to submit */}
      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center gap-2">
        {/* Swap Control */}
        {!match.isPlayoff && match.matchType !== 'tiebreaker' && onSwapMatches && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-extrabold shrink-0">جابه‌جایی با:</span>
            <select
              value=""
              onChange={(e) => {
                const targetDayNumber = Number(e.target.value);
                if (targetDayNumber) {
                  const targetMatch = matches.find(m => !m.isPlayoff && m.matchType !== 'tiebreaker' && m.dayNumber === targetDayNumber);
                  if (targetMatch) {
                    onSwapMatches(match.id, targetMatch.id);
                  }
                }
              }}
              className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-[10px] font-black rounded-md px-1.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer transition-all max-w-[110px] md:max-w-[130px] truncate"
            >
              <option value="" disabled>انتخاب...</option>
              {matches
                .filter(m => !m.isPlayoff && m.matchType !== 'tiebreaker' && m.id !== match.id)
                .map(m => {
                  const p1Other = players.find(p => p.id === m.player1Id)?.name || '';
                  const p2Other = players.find(p => p.id === m.player2Id)?.name || '';
                  return (
                    <option key={m.id} value={m.dayNumber}>
                      ب. {m.dayNumber} ({p1Other} - {p2Other})
                    </option>
                  );
                })}
            </select>
          </div>
        )}

        <button
          onClick={() => onEditScore(match)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all duration-300 ${
            match.status === 'completed'
              ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              : 'bg-white text-slate-950 hover:bg-slate-100 font-bold shadow-lg shadow-white/5'
          }`}
        >
          {match.status === 'completed' ? (
            <>
              <Edit2 className="w-3.5 h-3.5" />
              <span>ویرایش امتیاز</span>
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
