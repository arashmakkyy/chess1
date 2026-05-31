/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player } from '../types';
import { PlayerAvatar } from './player/PlayerAvatar';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Swords, Sparkles, Award, Star, RefreshCw } from 'lucide-react';

interface HeroSectionProps {
  players: Player[];
  onStartTournament: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  players,
  onStartTournament
}) => {
  const [shuffling, setShuffling] = useState(false);
  const [shuffleIndex, setShuffleIndex] = useState(0);

  const startLotteryFlow = () => {
    setShuffling(true);
    let count = 0;
    
    // Create an amazing visual shuffle effect for names
    const interval = setInterval(() => {
      setShuffleIndex(prev => (prev + 1) % players.length);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setShuffling(false);
        onStartTournament();
      }
    }, 120);
  };

  const quotes = [
    '«شطرنج نبردی است مداوم علیه شرایط مغشوش ذهن ما.»',
    '«حرکت اول، استراتژی؛ حرکت آخر، جادوی اراده!»',
    '«صفحه شطرنج، فیزیک نبرد افکار و افق دید مهره‌هاست.»',
    '«جذابیت شطرنج در آن است که از خوش‌اقبالی خبری نیست!»'
  ];

  return (
    <div className="w-full relative text-right py-6 md:py-12 overflow-hidden">
      {/* Visual glowing design circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main hero brand presentation */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs text-blue-300 font-bold mb-4 uppercase tracking-widest leading-none">
          <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
          <span>لیگ سراسری شطرنج شوالیه‌ها ٢٠٢٦</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight leading-tight md:leading-tight mb-4 drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]">
          جام نبرد مغزها
        </h1>

        <p className="text-xs md:text-sm text-slate-350 max-w-xl leading-relaxed mb-6 font-semibold">
          آرش، علیرضا، محمد و مهرداد در نبردی استراتژیک و تن‌به‌تن برای فتح جام طلایی حضور خواهند داشت. به صورت زنده، نتایج راندهای اصلی و دیدارهای حذفی تای‌بریک را رهگیری، ثبت و ارزیابی کنید.
        </p>

        <p className="text-xs text-blue-300 font-mono italic">
          {quotes[shuffleIndex % quotes.length]}
        </p>
      </div>

      {/* Players Lineup Cards Grid */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-sm font-extrabold text-slate-400 border-b border-white/10 pb-3 mb-6 flex items-center justify-start gap-2">
          <span>شوالیه‌های حاضر در لیگ شطرنج</span>
          <Swords className="w-4 h-4 text-slate-500" />
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {players.map((p, idx) => {
            const isTargetHighlight = shuffling && shuffleIndex === idx;

            return (
              <Card
                key={p.id}
                variant={isTargetHighlight ? 'neon' : 'glass'}
                className={`relative overflow-hidden text-center transition-all duration-300 ${
                  isTargetHighlight 
                    ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-white/15 scale-102 backdrop-blur-xl' 
                    : 'hover:border-white/20'
                }`}
              >
                {isTargetHighlight && (
                  <div className="absolute top-2 left-2 text-[10px] bg-blue-500 text-white font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-wider animate-pulse">
                    🎯 قرعه‌کشی
                  </div>
                )}
                
                <div className="flex flex-col items-center py-4">
                  <PlayerAvatar name={p.name} size="md" className="mb-4" />
                  <h3 className="text-base font-extrabold text-slate-200">{p.name}</h3>
                  <div className="flex gap-1.5 items-center justify-center mt-2.5 text-[10px] text-slate-400 font-semibold">
                    <Award className="w-3.5 h-3.5 text-slate-500" />
                    <span>کاندیدای قهرمانی</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Dynamic initiation button */}
        <div className="flex flex-col items-center">
          {shuffling ? (
            <div className="flex flex-col items-center gap-3 py-4 animate-pulse">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-xs text-blue-300 font-bold font-sans">در حال شافل و توزیع رندوم فیکسچرها، بستر دور برگشت و تنظیم تقویم...</p>
            </div>
          ) : (
            <Button
              variant="glow"
              size="lg"
              onClick={startLotteryFlow}
              className="px-10 py-4 shadow-[0_0_25px_rgba(59,130,246,0.15)] flex items-center gap-2 font-black text-sm md:text-base cursor-pointer"
            >
              <Swords className="w-5 h-5" />
              <span>قرعه‌کشی و شروع رسمی مسابقات لیگ شطرنج</span>
            </Button>
          )}

          <div className="mt-6 flex gap-4 text-[10px] text-slate-500 font-semibold">
            <span>⚔️ ۱۲ فیکسچر معتبر دور گروهی</span>
            <span>•</span>
            <span>📅 برنامه‌نویسی برای استراحت جمعه‌ها</span>
            <span>•</span>
            <span>🔥 تای‌بریک برای راند سوم مساوی‌ها</span>
          </div>
        </div>
      </div>
    </div>
  );
};
