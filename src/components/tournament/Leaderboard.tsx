/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player } from '../../types';
import { GroupLeaderboard } from './GroupLeaderboard';
import { Trophy, LayoutGrid, Layers } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  const [viewMode, setViewMode] = useState<'both' | 'A' | 'B'>('both');

  return (
    <div className="w-full space-y-6">
      {/* View Switcher Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 text-white">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-extrabold text-slate-100">
              جداول رده‌بندی دو گروه A و B
            </h2>
            <p className="text-[11px] text-slate-400">
              ۱۰ بازیکن در ۲ گروه ۵ نفره (هر بازیکن ۴ بازی یک‌طرفه انجام می‌دهد)
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-stretch sm:self-auto">
          <button
            onClick={() => setViewMode('both')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'both'
                ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>هر دو گروه</span>
          </button>

          <button
            onClick={() => setViewMode('A')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'A'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>گروه الف (A)</span>
          </button>

          <button
            onClick={() => setViewMode('B')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'B'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>گروه ب (B)</span>
          </button>
        </div>
      </div>

      {/* Grid of group leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(viewMode === 'both' || viewMode === 'A') && (
          <div className={viewMode === 'A' ? 'lg:col-span-2' : ''}>
            <GroupLeaderboard group="A" players={players} />
          </div>
        )}

        {(viewMode === 'both' || viewMode === 'B') && (
          <div className={viewMode === 'B' ? 'lg:col-span-2' : ''}>
            <GroupLeaderboard group="B" players={players} />
          </div>
        )}
      </div>
    </div>
  );
};
