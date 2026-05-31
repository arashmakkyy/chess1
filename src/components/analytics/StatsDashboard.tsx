/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../../types';
import { Card } from '../common/Card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Zap, Target } from 'lucide-react';

interface StatsDashboardProps {
  players: Player[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ players }) => {
  // 1. Data mapping for cumulative tournament standings (Bar Chart)
  const barChartData = players.map(p => ({
    name: p.name,
    'امتیاز لیگ': p.points,
    'بردهای فیکسچر': p.matchesWon,
    'باخت‌های فیکسچر': p.matchesLost
  })).sort((a, b) => b['امتیاز لیگ'] - a['امتیاز لیگ']);

  // 2. Data mapping for individual hand wins/draws/losses (Stacked Bar Chart / Ratio)
  const gamesBreakdownData = players.map(p => ({
    name: p.name,
    'دست‌های برده (برد)': p.gamesWon,
    'دست‌های مساوی شده': p.gamesDrew,
    'دست‌های باخته (باخت)': p.gamesLost
  }));

  // 3. Overall ratio of total tournament games results (Pie Chart)
  const totalGamesWon = players.reduce((sum, p) => sum + p.gamesWon, 0);
  const totalGamesDrew = players.reduce((sum, p) => sum + p.gamesDrew, 0);
  const totalGamesLost = players.reduce((sum, p) => sum + p.gamesLost, 0);

  const pieChartData = [
    { name: 'پیروزی قاطع', value: totalGamesWon, color: '#10b981' }, // Emerald
    { name: 'تساوی فنی', value: totalGamesDrew, color: '#6366f1' },  // Indigo
    { name: 'نتایج باخت', value: totalGamesLost, color: '#f43f5e' }   // Rose
  ].filter(item => item.value > 0);

  // Simple statistics calculations
  const totalCompletedMatches = players.reduce((sum, p) => sum + p.matchesPlayed, 0) / 2; // Each match shared by 2 players
  const aggressivePlayer = [...players].sort((a, b) => b.gamesWon - a.gamesWon)[0];
  const defensivePlayer = [...players].sort((a, b) => b.gamesDrew - a.gamesDrew)[0];

  return (
    <div className="w-full space-y-8 text-right">
      {/* Intro section */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-5 mb-6">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
          <BarChart3 className="w-5 h-5 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-100">تحلیل آماری و نمودارهای لیگ</h2>
          <p className="text-xs text-slate-400 mt-0.5">بررسی بصری عملکرد، درصد برد و تقسیم نتایج هوشمند در بازی‌ها</p>
        </div>
      </div>

      {/* Highlights metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card variant="flat" className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="absolute top-4 left-4 p-2 rounded-xl bg-blue-500/10 text-blue-300">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold">تهاجمی‌ترین بازیکن (بیشترین برد دست)</span>
          <h4 className="text-lg font-black text-slate-200 mt-1.5">{aggressivePlayer?.name || '---'}</h4>
          <p className="text-xs text-slate-400 mt-1">با ثبت <span className="font-mono text-emerald-400 font-extrabold">{aggressivePlayer?.gamesWon || 0}</span> برد در راندهای انفرادی</p>
        </Card>

        <Card variant="flat" className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="absolute top-4 left-4 p-2 rounded-xl bg-purple-500/10 text-purple-300">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold font-sans">محافظه‌کارترین بازیکن (بیشترین تساوی)</span>
          <h4 className="text-lg font-black text-slate-200 mt-1.5">{defensivePlayer?.name || '---'}</h4>
          <p className="text-xs text-slate-400 mt-1">با ثبت <span className="font-mono text-blue-300 font-extrabold">{defensivePlayer?.gamesDrew || 0}</span> تساوی فنی مسابقاتی</p>
        </Card>

        <Card variant="flat" className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="absolute top-4 left-4 p-2 rounded-xl bg-blue-500/10 text-blue-300">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold">فیکسچرهای گروهی پایان‌یافته</span>
          <h4 className="text-lg font-black text-slate-200 mt-1.5">{totalCompletedMatches} از ۱۲ فیکسچر</h4>
          <p className="text-xs text-slate-400 mt-1">تکمیل شدن <span className="font-mono text-blue-300 font-extrabold">{Math.round((totalCompletedMatches / 12) * 100)}%</span> از رقابت‌های دور اول</p>
        </Card>
      </div>

      {/* Main Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart - Points Comparison */}
        <Card variant="glass" className="border-white/10 bg-white/5">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-200">مقایسه امتیازات کل لیگ</h3>
          </div>
          <div className="h-64 md:h-80 w-full" style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                    fontFamily: 'sans-serif',
                    fontSize: '12px',
                    textAlign: 'right'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="امتیاز لیگ" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Stacked Bar Chart - Individual Game Results */}
        <Card variant="glass" className="border-white/10 bg-white/5">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
            <Target className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-200">آنالیز برد و باخت دست‌ها (راندهای بازی)</h3>
          </div>
          <div className="h-64 md:h-80 w-full" style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gamesBreakdownData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                    fontFamily: 'sans-serif',
                    fontSize: '12px',
                    textAlign: 'right'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="دست‌های برده (برد)" stackId="a" fill="#10b981" />
                <Bar dataKey="دست‌های مساوی شده" stackId="a" fill="#3b82f6" />
                <Bar dataKey="دست‌های باخته (باخت)" stackId="a" fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart - Overall game results distribution */}
        {pieChartData.length > 0 && (
          <Card variant="glass" className="border-white/10 bg-white/5 lg:col-span-2 max-w-xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
              <PieIcon className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-200">سهم نتایج کل بازی‌های لیگ</h3>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-around gap-6">
              {/* Pie display element */}
              <div className="h-48 w-48" style={{ direction: 'ltr' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="55%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '12px',
                        color: '#f1f5f9',
                        fontSize: '11px',
                        textAlign: 'right'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends list */}
              <div className="space-y-3 shrink-0 text-right w-full max-w-xs">
                {pieChartData.map((item, index) => {
                  const percentage = Math.round(
                    (item.value / (totalGamesWon + totalGamesDrew + totalGamesLost)) * 100
                  );
                  return (
                    <div key={index} className="flex items-center justify-between gap-6 font-semibold text-xs text-slate-400 w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-200">{item.name}</span>
                      </div>
                      <div className="text-slate-300 font-mono">
                        <span className="text-slate-100 font-black">{item.value}</span> دست ({percentage}٪)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
