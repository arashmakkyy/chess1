/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Match, Player } from '../../types';
import { FixtureCard } from './FixtureCard';
import { Kanban, Sparkles, Filter, CheckCircle, CalendarDays, Layers } from 'lucide-react';
import { Card } from '../common/Card';

interface FixtureListProps {
  matches: Match[];
  players: Player[];
  onEditScore: (match: Match) => void;
  onSwapMatches?: (matchIdA: string, matchIdB: string) => void;
}

type FilterType = 'all' | 'groupA' | 'groupB' | 'pending' | 'completed';

export const FixtureList: React.FC<FixtureListProps> = ({
  matches,
  players,
  onEditScore,
  onSwapMatches
}) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredMatches = matches.filter((match) => {
    if (filter === 'groupA') return match.group === 'A';
    if (filter === 'groupB') return match.group === 'B';
    if (filter === 'pending') return match.status === 'scheduled';
    if (filter === 'completed') return match.status === 'completed';
    return true;
  });

  const groupAMatchesCount = matches.filter((m) => m.group === 'A').length;
  const groupBMatchesCount = matches.filter((m) => m.group === 'B').length;

  return (
    <div className="w-full space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
            <Kanban className="w-5 h-5 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-extrabold text-slate-100">
              برنامه فیکسچرهای دور گروهی لیگ
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ترتیب بازی‌های یک‌طرفه گروه‌ها متناوباً بر اساس تقویم روزانه (استراحت جمعه‌ها)
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md flex-wrap gap-1 w-full lg:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white/10 text-white border border-white/5 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>همه ({matches.length})</span>
          </button>

          <button
            onClick={() => setFilter('groupA')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'groupA'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>گروه الف ({groupAMatchesCount})</span>
          </button>

          <button
            onClick={() => setFilter('groupB')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'groupB'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>گروه ب ({groupBMatchesCount})</span>
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-white/10 text-white border border-white/5 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>پیش‌رو ({matches.filter((m) => m.status === 'scheduled').length})</span>
          </button>

          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-white/10 text-white border border-white/5 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>پایان‌یافته ({matches.filter((m) => m.status === 'completed').length})</span>
          </button>
        </div>
      </div>

      {/* Friday notification hint banner */}
      <Card variant="flat" className="border-white/10 bg-white/5 text-slate-200 text-right">
        <p className="text-xs text-slate-400 leading-relaxed font-semibold">
          💡 <strong className="text-slate-200">فرمت بازی‌های فصل جدید:</strong> مسابقات دور گروهی
          کاملاً یک‌طرفه (تک‌بازی) بوده و بازی‌ها روزانه برگزار می‌گردند. روزهای{' '}
          <strong className="text-blue-300">جمعه تعطیل مطلق</strong> است.
        </p>
      </Card>

      {/* Grid Layout of Matches */}
      {filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-zinc-900 rounded-2xl py-12 px-6 text-center text-zinc-500">
          <Filter className="w-10 h-10 text-zinc-700 mb-3" />
          <p className="text-sm font-bold">هیچ مسابقه‌ای در این وضعیت یافت نشد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMatches.map((match) => (
            <FixtureCard
              key={match.id}
              match={match}
              players={players}
              onEditScore={onEditScore}
              matches={matches}
              onSwapMatches={onSwapMatches}
            />
          ))}
        </div>
      )}
    </div>
  );
};
