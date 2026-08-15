/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, Match } from '../../types';
import { Card } from '../common/Card';
import { GroupComparisonCard } from './GroupComparisonCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Trophy, Target, Award, Flame, Zap, Swords } from 'lucide-react';

interface StatsDashboardProps {
  players: Player[];
  matches: Match[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  players,
  matches
}) => {
  const completedMatches = matches.filter((m) => m.status === 'completed');
  const totalMatches = matches.length;

  const totalWins = players.reduce((sum, p) => sum + p.matchesWon, 0);
  const totalGamesPlayed = players.reduce((sum, p) => sum + p.matchesPlayed, 0);

  // Group players by points for leader bar chart
  const barData = [...players]
    .sort((a, b) => b.points - a.points)
    .map((p) => ({
      name: p.name.split(' ')[0], // short first name for chart label
      fullName: p.name,
      group: p.group === 'A' ? 'گروه الف' : 'گروه ب',
      امتیاز: p.points,
      برد: p.matchesWon
    }));

  const pieData = [
    {
      name: 'بازی‌های انجام‌شده',
      value: completedMatches.length,
      color: '#3b82f6'
    },
    {
      name: 'بازی‌های باقی‌مانده',
      value: Math.max(0, totalMatches - completedMatches.length),
      color: 'rgba(255,255,255,0.1)'
    }
  ];

  const topScorer = [...players].sort((a, b) => b.points - a.points)[0];

  return (
    <div className="w-full space-y-6">
      {/* Header and key summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="border-white/10" padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">تعداد شرکت‌کنندگان</span>
              <span className="text-lg font-black text-slate-100 font-mono">
                {players.length} بازیکن
              </span>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="border-white/10" padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">پیشرفت کل لیگ</span>
              <span className="text-lg font-black text-emerald-300 font-mono">
                {completedMatches.length} / {totalMatches}
              </span>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="border-white/10" padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">برترین امتیازدار کل</span>
              <span className="text-xs md:text-sm font-black text-amber-300 truncate max-w-[120px] block mt-0.5">
                {topScorer?.name || '-'} ({topScorer?.points || 0}پ)
              </span>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="border-white/10" padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">فرمت برگزاری</span>
              <span className="text-xs font-black text-purple-300 block mt-0.5">
                ۲ گروه ➔ حذفی ضربدری
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Group Comparison */}
      <GroupComparisonCard players={players} matches={matches} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Points ranking chart */}
        <Card variant="glass" className="lg:col-span-2 border-white/10" padding="md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <h3 className="text-xs md:text-sm font-black text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" />
              <span>نمودار رده‌بندی امتیازات کل بازیکنان</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">به ترتیب بیشترین امتیاز</span>
          </div>

          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                    textAlign: 'right'
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} (${item.payload.group})`,
                    name === 'امتیاز' ? 'امتیاز کل' : 'تعداد برد'
                  ]}
                  labelFormatter={(label: any, payload: any) =>
                    payload[0]?.payload?.fullName || label
                  }
                />
                <Bar dataKey="امتیاز" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Progress pie chart */}
        <Card variant="glass" className="border-white/10" padding="md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <h3 className="text-xs md:text-sm font-black text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>پیشرفت مسابقات</span>
            </h3>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-100 font-mono">
                {Math.round((completedMatches.length / (totalMatches || 1)) * 100)}%
              </span>
              <span className="text-[10px] text-slate-400 font-bold">تکمیل شده</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2 border-t border-white/10 pt-3">
            <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
              <span className="text-[10px] text-blue-300 block font-bold">انجام شده</span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {completedMatches.length} بازی
              </span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block font-bold">باقی‌مانده</span>
              <span className="text-sm font-bold text-slate-300 font-mono">
                {Math.max(0, totalMatches - completedMatches.length)} بازی
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
