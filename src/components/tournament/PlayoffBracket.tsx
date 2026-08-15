/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Match, Player, TournamentState } from '../../types';
import { Card } from '../common/Card';
import { PlayoffMatchCard } from './PlayoffMatchCard';
import { Trophy, ShieldAlert, Award, Star, ArrowLeft, Sparkles, Swords } from 'lucide-react';

interface PlayoffBracketProps {
  players: Player[];
  playoffMatches: TournamentState['playoffMatches'];
  playoffStarted: boolean;
  onEditScore: (match: Match) => void;
  onStartPlayoffs: () => void;
}

export const PlayoffBracket: React.FC<PlayoffBracketProps> = ({
  players,
  playoffMatches,
  playoffStarted,
  onEditScore,
  onStartPlayoffs
}) => {
  // Sort Group A players
  const groupAPlayers = players.filter((p) => p.group === 'A').sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
    return b.gamesWon - a.gamesWon;
  });

  // Sort Group B players
  const groupBPlayers = players.filter((p) => p.group === 'B').sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
    return b.gamesWon - a.gamesWon;
  });

  const a1 = groupAPlayers[0];
  const a2 = groupAPlayers[1];
  const b1 = groupBPlayers[0];
  const b2 = groupBPlayers[1];

  const { semiFinal1, semiFinal2, final, thirdPlace } = playoffMatches;

  const bothSemiCompleted =
    semiFinal1?.status === 'completed' && semiFinal2?.status === 'completed';

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-white">
            <Trophy className="w-5 h-5 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-100">
              مرحله حذفی و پلی‌آف ضربدری (Playoffs)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              نفرات اول و دوم دو گروه به صورت ضربدری در نیمه‌نهایی با هم مبارزه می‌کنند
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>فرمت: نیمه‌نهایی ضربدری ➔ فینال و رده‌بندی</span>
        </div>
      </div>

      {!playoffStarted ? (
        <Card variant="glow-gold" className="text-center p-8 border-white/15">
          <Award className="w-12 h-12 text-blue-400 mx-auto mb-4 filter drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
          <h3 className="text-lg font-extrabold text-slate-100 mb-2">
            در انتظار اتمام مرحله گروهی مسابقات
          </h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed mb-6">
            برای باز شدن اتوماتیک نیمه‌نهایی، فینال و رده‌بندی، تمام بازی‌های هر دو گروه باید ثبت و تکمیل شوند. سپس نفرات اول و دوم به شکل ضربدری جفت می‌شوند.
          </p>

          {/* Theoretical Matchups Preview */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md max-w-xl mx-auto text-right">
            <h4 className="text-xs font-bold text-slate-300 border-b border-white/10 pb-2 mb-4 flex items-center justify-between">
              <span>چیدمان ضربدری بر اساس جدول زنده فعلی:</span>
              <span className="text-[10px] text-amber-400 font-mono">وضعیت لحظه‌ای</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                <div className="flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-bold">نیمه‌نهایی ۱ (A1 vs B2):</span>
                </div>
                <span className="text-slate-100 font-black">
                  {a1?.name || 'تیم ۱ گروه A'} ⚔️ {b2?.name || 'تیم ۲ گروه B'}
                </span>
              </div>

              <div className="flex justify-between items-center bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                <div className="flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300 font-bold">نیمه‌نهایی ۲ (B1 vs A2):</span>
                </div>
                <span className="text-slate-100 font-black">
                  {b1?.name || 'تیم ۱ گروه B'} ⚔️ {a2?.name || 'تیم ۲ گروه A'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* STEP 1: SEMI-FINALS (CROSS-OVER) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
              <Swords className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-extrabold text-blue-300">
                مرحله ۱: دیدارهای نیمه‌نهایی ضربدری (Semi-Finals)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {semiFinal1 && (
                <PlayoffMatchCard
                  match={semiFinal1}
                  players={players}
                  title="نیمه‌نهایی ۱ (Semi-Final 1)"
                  subtitle="اول گروه الف ⚔️ دوم گروه ب"
                  onEditScore={onEditScore}
                  accentColor="blue"
                />
              )}

              {semiFinal2 && (
                <PlayoffMatchCard
                  match={semiFinal2}
                  players={players}
                  title="نیمه‌نهایی ۲ (Semi-Final 2)"
                  subtitle="اول گروه ب ⚔️ دوم گروه الف"
                  onEditScore={onEditScore}
                  accentColor="purple"
                />
              )}
            </div>
          </div>

          {/* STEP 2: FINALS & THIRD PLACE */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-extrabold text-amber-300">
                مرحله ۲: فینال بزرگ قهرمانی و دیدار رده‌بندی سومی (Grand Final & 3rd Place)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grand Final */}
              {final && (
                <PlayoffMatchCard
                  match={final}
                  players={players}
                  title="👑 فینال بزرگ قهرمانی (Grand Final)"
                  subtitle="تعیین قهرمان و نایب قهرمان لیگ"
                  isLocked={!bothSemiCompleted}
                  lockMessage="پس از اتمام هر دو بازی نیمه‌نهایی باز می‌شود"
                  onEditScore={bothSemiCompleted ? onEditScore : undefined}
                  accentColor="amber"
                />
              )}

              {/* 3rd Place Match */}
              {thirdPlace && (
                <PlayoffMatchCard
                  match={thirdPlace}
                  players={players}
                  title="🥉 دیدار رده‌بندی (Third Place Match)"
                  subtitle="کسب مدال برنز و رتبه سوم لیگ"
                  isLocked={!bothSemiCompleted}
                  lockMessage="پس از اتمام هر دو بازی نیمه‌نهایی باز می‌شود"
                  onEditScore={bothSemiCompleted ? onEditScore : undefined}
                  accentColor="emerald"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
