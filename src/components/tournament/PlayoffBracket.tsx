/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Match, Player } from '../../types';
import { Card } from '../common/Card';
import { FixtureCard } from './FixtureCard';
import { Trophy, ShieldAlert, Award, Star } from 'lucide-react';

interface PlayoffBracketProps {
  players: Player[];
  finalMatch: Match | null;
  thirdPlaceMatch: Match | null;
  onEditScore: (match: Match) => void;
  onStartPlayoffs: () => void;
}

export const PlayoffBracket: React.FC<PlayoffBracketProps> = ({
  players,
  finalMatch,
  thirdPlaceMatch,
  onEditScore,
  onStartPlayoffs
}) => {
  // Sort players to find the rankings
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
    return b.gamesWon - a.gamesWon;
  });

  const top1 = sortedPlayers[0];
  const top2 = sortedPlayers[1];
  const top3 = sortedPlayers[2];
  const top4 = sortedPlayers[3];

  const hasPlayoffs = finalMatch !== null && thirdPlaceMatch !== null;

  return (
    <div className="w-full">
      {/* Playoff bracket header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
            <Trophy className="w-5 h-5 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-100">مرحله نهایی حذفی (پلی‌آف)</h2>
            <p className="text-xs text-slate-400 mt-0.5">جدال قهرمانی و جایگاه‌های پایانی رتبه‌ها</p>
          </div>
        </div>
      </div>

      {!hasPlayoffs ? (
        <Card variant="glow-gold" className="text-center p-8 border-white/15">
          <Award className="w-12 h-12 text-blue-300 mx-auto mb-4 filter drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
          <h3 className="text-lg font-extrabold text-slate-100 mb-2">در انتظار اتمام مسابقات گروهی</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
            برای باز شدن اتوماتیک فینال بزرگ و رده‌بندی، باید تمام ۱۲ فیکسچر مرحله دور گروهی برگزار و نتایج کامل آنها ثبت شود. سپس بر اساس امتیاز نهایی بازیکنان برتر انتخاب می‌شوند.
          </p>

          {/* Show potential rankings based on current stats */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md max-w-md mx-auto text-right">
            <h4 className="text-xs font-bold text-slate-400 border-b border-white/10 pb-2 mb-3">چیدمان فرضی فینال بر اساس جایگاه فعلی:</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                <span className="text-blue-300 font-bold">فینال طـلایـی (اول و دوم)</span>
                <span className="text-slate-200 font-black">{top1.name} ⚔️ {top2.name}</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                <span className="text-purple-300 font-bold">رده‌بـنـدی (سوم و چهارم)</span>
                <span className="text-slate-200 font-black">{top3.name} ⚔️ {top4.name}</span>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Third Place Match Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1 text-right">
              <Star className="w-4 h-4 text-purple-300" />
              <h3 className="text-sm font-extrabold text-purple-300 uppercase tracking-widest">دیدار رده‌بندی (کسب رتبه سوم و چهارم)</h3>
            </div>
            {thirdPlaceMatch && (
              <FixtureCard
                match={thirdPlaceMatch}
                players={players}
                onEditScore={onEditScore}
              />
            )}
            <Card variant="flat" className="text-xs text-slate-400 bg-white/5 text-right border-white/10">
              تیم سوم لیگ پس از اتمام این دیدار از بین <strong className="text-slate-200">{top3.name}</strong> و <strong className="text-slate-200">{top4.name}</strong> برگزیده خواهد شد.
            </Card>
          </div>

          {/* Grand Final Match Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1 text-right">
              <Trophy className="w-4 h-4 text-blue-300 animate-pulse" />
              <h3 className="text-sm font-extrabold text-blue-300 uppercase tracking-widest">فینال بزرگ قهرمانی (کسب رتبه‌های اول و دوم)</h3>
            </div>
            {finalMatch && (
              <FixtureCard
                match={finalMatch}
                players={players}
                onEditScore={onEditScore}
              />
            )}
            <Card variant="glow-gold" className="text-xs text-slate-400 bg-white/5 text-right border-white/10">
              👑 برنده این مسابقه حساس قهرمان بلامنازع جام شطرنج خواهد بود؛ نبردی نفس‌گیر میان <strong className="text-blue-300">{top1.name}</strong> و <strong className="text-blue-300">{top2.name}</strong>.
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
