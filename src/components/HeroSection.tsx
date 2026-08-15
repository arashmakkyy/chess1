/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player } from '../types';
import { PlayerAvatar } from './player/PlayerAvatar';
import { GroupBadge } from './player/GroupBadge';
import { Card } from './common/Card';
import { Trophy, Swords, Shuffle, Sparkles, Flame, CheckCircle } from 'lucide-react';

interface HeroSectionProps {
  players: Player[];
  isStarted: boolean;
  onStartTournament: () => void;
  onShuffleGroups?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  players,
  isStarted,
  onStartTournament,
  onShuffleGroups
}) => {
  const groupAPlayers = players.filter((p) => p.group === 'A');
  const groupBPlayers = players.filter((p) => p.group === 'B');

  const [shuffling, setShuffling] = useState(false);

  const handleShuffle = () => {
    if (!onShuffleGroups) return;
    setShuffling(true);
    setTimeout(() => {
      onShuffleGroups();
      setShuffling(false);
    }, 400);
  };

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 md:p-10 mb-10">
      {/* Background glowing effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Main Title Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>فصل جدید مسابقات شطرنج ۱۰ نفره</span>
        </div>

        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight max-w-2xl leading-tight">
          لیگ برتر شطرنج: نبرد دو گروه و پلی‌آف ضربدری
        </h1>

        <p className="text-xs md:text-sm text-slate-400 mt-3 max-w-xl leading-relaxed">
          ۱۰ مبارز در دو گروه ۵ نفره الف و ب؛ مسابقات یک‌طرفه (تک‌بازی)، صعود ۲ نفر برتر هر گروه به نیمه‌نهایی ضربدری و تاج‌گذاری در فینال قهرمانی.
        </p>

        {/* Action button if not started */}
        {!isStarted ? (
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            {onShuffleGroups && (
              <button
                onClick={handleShuffle}
                disabled={shuffling}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs transition-all cursor-pointer"
              >
                <Shuffle className={`w-4 h-4 text-purple-400 ${shuffling ? 'animate-spin' : ''}`} />
                <span>قرعه‌کشی مجدد گروه‌ها</span>
              </button>
            )}

            <button
              onClick={onStartTournament}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-sm shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all cursor-pointer transform hover:scale-105"
            >
              <Swords className="w-4 h-4 text-blue-600" />
              <span>شروع رسمی لیگ و تولید تقویم بازی‌ها</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl text-xs font-bold text-emerald-300">
            <CheckCircle className="w-4 h-4" />
            <span>لیگ فعال است - بازی‌ها و جدول به‌صورت زنده به‌روزرسانی می‌شوند</span>
          </div>
        )}

        {/* Showcase the 2 groups with 5 players each */}
        <div className="mt-10 w-full grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
          {/* Group A Box */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-blue-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="text-sm font-black text-blue-300">گروه الف (Group A)</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">۵ مبارز</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {groupAPlayers.map((p) => (
                <div key={p.id} className="flex flex-col items-center text-center">
                  <PlayerAvatar name={p.name} size="sm" className="mb-1" />
                  <span className="text-[10px] font-extrabold text-slate-200 truncate w-full">
                    {p.name.split(' ')[0]}
                  </span>
                  <span className="text-[8px] text-slate-400 truncate w-full">
                    {p.name.split(' ')[1] || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Group B Box */}
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-purple-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span className="text-sm font-black text-purple-300">گروه ب (Group B)</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">۵ مبارز</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {groupBPlayers.map((p) => (
                <div key={p.id} className="flex flex-col items-center text-center">
                  <PlayerAvatar name={p.name} size="sm" className="mb-1" />
                  <span className="text-[10px] font-extrabold text-slate-200 truncate w-full">
                    {p.name.split(' ')[0]}
                  </span>
                  <span className="text-[8px] text-slate-400 truncate w-full">
                    {p.name.split(' ')[1] || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
