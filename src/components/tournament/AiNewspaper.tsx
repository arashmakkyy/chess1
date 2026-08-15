/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, Match } from '../../types';
import { Card } from '../common/Card';
import { Sparkles, Newspaper, RefreshCw, Bot, AlertCircle, Quote } from 'lucide-react';

interface AiNewspaperProps {
  players: Player[];
  matches: Match[];
  playoffStarted: boolean;
}

export const AiNewspaper: React.FC<AiNewspaperProps> = ({
  players,
  matches,
  playoffStarted
}) => {
  const [commentary, setCommentary] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const completedMatches = matches.filter((m) => m.status === 'completed');

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players,
          matches: completedMatches,
          playoffStarted
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'خطا در تولید گزارش هوش مصنوعی');
      }

      setCommentary(data.commentary);
    } catch (err: any) {
      console.error('AI Newspaper Error:', err);
      setError(err.message || 'خطایی در ارتباط با هوش مصنوعی رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      variant="glass"
      className="w-full border-blue-500/20 shadow-2xl relative overflow-hidden"
      padding="md"
    >
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <Newspaper className="w-5 h-5 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base md:text-lg font-black text-slate-100">
                روزنامه هوشمند و تحلیل کارشناسی لیگ
              </h3>
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                <Bot className="w-3 h-3" />
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              تحلیل دراماتیک رویدادهای گروه‌های A و B و پیش‌بینی صعود به نیمه‌نهایی ضربدری
            </p>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'در حال نگارش تحلیل...' : 'تولید تحلیل جدید'}</span>
        </button>
      </div>

      {/* Content Body */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {commentary ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-line space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2">
            <Quote className="w-4 h-4" />
            <span>گزارش زنده تحلیل‌گر ویژه:</span>
          </div>
          <p className="font-normal text-slate-200 leading-loose">{commentary}</p>
        </div>
      ) : (
        <div className="py-10 text-center text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
          <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-3 opacity-60 animate-pulse" />
          <p className="text-xs font-bold text-slate-300">
            هنوز تحلیلی برای این دور تولید نشده است.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            با زدن دکمه «تولید تحلیل جدید»، آخرین اتفاقات و وضعیت صعود هر دو گروه را مشاهده کنید.
          </p>
        </div>
      )}
    </Card>
  );
};
