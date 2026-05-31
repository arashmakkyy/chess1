import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Newspaper, RefreshCw, Flame, HelpCircle, AlertCircle, Quote } from 'lucide-react';
import { Match, Player, TournamentState } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface AiNewspaperProps {
  state: TournamentState;
}

interface CommentaryData {
  lastMatchComment: string;
  nextMatchComment: string;
  hash: string;
}

// Hilarious loading phrases that rotate to entertain Gen Z players during API call
const LOADING_PHRASES = [
  'در حال هم زدن استراتژی‌های آرش... 🌪️',
  'محاسبه زاویه دقیق فشار خوردن بازنده... 📈',
  'آنالیز درصد سم جاری در راندهای گذشته... 🧪',
  'تحلیل کری‌خوانی‌های زیرپوستی ستون‌ها... 💬',
  'شستشوی مغز علیرضا برای حرکت‌های بعدی... 🧠',
  'محاسبه فوران آدرنالین محمد روی کیبورد... ⚡',
  'اندازه‌گیری عمق آچمزهای مهرداد... 📏',
  'دم کردن چای زعفرونی مفسر هوش مصنوعی... ☕'
];

export const AiNewspaper: React.FC<AiNewspaperProps> = ({ state }) => {
  const { matches, players } = state;

  const [commentary, setCommentary] = useState<CommentaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [phraseIndex, setPhraseIndex] = useState<number>(0);

  // Compute a state hash to detect if a new match has been completed
  const completedMatchesCount = matches.filter((m) => m.status === 'completed').length;
  const playoffCompletedCount = [state.playoffMatches.final, state.playoffMatches.thirdPlace].filter(
    (m) => m !== null && m.status === 'completed'
  ).length;
  
  const currentHash = `${completedMatchesCount}-${playoffCompletedCount}-${state.playoffStarted ? 'p' : 'g'}`;

  // Find latest completed match
  let lastCompletedMatch: Match | null = null;
  if (state.playoffStarted) {
    const playoffCompleted = [state.playoffMatches.final, state.playoffMatches.thirdPlace].filter(
      (m): m is Match => m !== null && m.status === 'completed'
    );
    if (playoffCompleted.length > 0) {
      lastCompletedMatch = playoffCompleted[0];
    }
  }
  if (!lastCompletedMatch) {
    const groupCompleted = matches.filter((m) => m.status === 'completed');
    if (groupCompleted.length > 0) {
      // Sort descending by dayNumber or date
      const sorted = [...groupCompleted].sort((a, b) => b.dayNumber - a.dayNumber);
      lastCompletedMatch = sorted[0];
    }
  }

  // Find next upcoming match
  let nextMatch: Match | null = null;
  if (state.playoffStarted) {
    const playoffScheduled = [state.playoffMatches.thirdPlace, state.playoffMatches.final].filter(
      (m): m is Match => m !== null && m.status === 'scheduled'
    );
    if (playoffScheduled.length > 0) {
      nextMatch = playoffScheduled[0];
    }
  }
  if (!nextMatch) {
    const groupScheduled = matches.filter((m) => m.status === 'scheduled');
    if (groupScheduled.length > 0) {
      // Sort ascending by dayNumber
      const sorted = [...groupScheduled].sort((a, b) => a.dayNumber - b.dayNumber);
      nextMatch = sorted[0];
    }
  }

  // Rotate loading phrases while generating commentary
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Load commentary from cache or trigger generation
  useEffect(() => {
    const cached = localStorage.getItem('chess_news_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as CommentaryData;
        if (parsed.hash === currentHash) {
          setCommentary(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse cached commentary', e);
      }
    }

    // Auto-generate if no cache or hash mismatch
    if (state.isStarted) {
      generateCommentary(true);
    }
  }, [currentHash, state.isStarted]);

  // Extract match data for API payload
  const getMatchStats = (match: Match | null, playersList: Player[]) => {
    if (!match) return null;
    const p1 = playersList.find((p) => p.id === match.player1Id);
    const p2 = playersList.find((p) => p.id === match.player2Id);
    
    let p1Won = 0;
    let p2Won = 0;
    let drew = 0;
    let isTiebreak = false;
    
    if (match.game1Result === 'P1_WIN') p1Won++;
    else if (match.game1Result === 'P2_WIN') p2Won++;
    else if (match.game1Result === 'DRAW') drew++;
    
    if (match.game2Result === 'P1_WIN') p1Won++;
    else if (match.game2Result === 'P2_WIN') p2Won++;
    else if (match.game2Result === 'DRAW') drew++;
    
    if (match.game3Result === 'P1_WIN') {
      p1Won++;
      isTiebreak = true;
    } else if (match.game3Result === 'P2_WIN') {
      p2Won++;
      isTiebreak = true;
    }
    
    const winnerName = match.winnerId ? (playersList.find((p) => p.id === match.winnerId)?.name || '') : null;
    
    return {
      p1Name: p1?.name || 'نامعلوم',
      p2Name: p2?.name || 'نامعلوم',
      winnerName,
      p1Won,
      p2Won,
      drew,
      isTiebreak
    };
  };

  const getNextMatchStats = (match: Match | null, playersList: Player[]) => {
    if (!match) return null;
    const p1 = playersList.find((p) => p.id === match.player1Id);
    const p2 = playersList.find((p) => p.id === match.player2Id);
    return {
      p1Name: p1?.name || 'نامعلوم',
      p2Name: p2?.name || 'نامعلوم',
      date: `${match.weekdayStr} ${match.dateStr}`
    };
  };

  const generateCommentary = async (isAuto = false) => {
    setLoading(true);
    setError(null);

    const lastMatchStats = getMatchStats(lastCompletedMatch, players);
    const nextMatchStats = getNextMatchStats(nextMatch, players);
    
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
    const standingsSummary = sortedPlayers.map((p) => ({
      name: p.name,
      points: p.points,
      matchesWon: p.matchesWon,
      matchesLost: p.matchesLost
    }));

    const historyData = matches
      .filter((m) => m.status === 'completed')
      .map((m) => {
        const p1Name = players.find((p) => p.id === m.player1Id)?.name || 'نامعلوم';
        const p2Name = players.find((p) => p.id === m.player2Id)?.name || 'نامعلوم';
        let result = '';
        if (m.isPlayoff) {
          let p1Games = 0;
          let p2Games = 0;
          if (m.game1Result === 'P1_WIN') p1Games++; else if (m.game1Result === 'P2_WIN') p2Games++;
          if (m.game2Result === 'P1_WIN') p1Games++; else if (m.game2Result === 'P2_WIN') p2Games++;
          if (m.game3Result === 'P1_WIN') p1Games++; else if (m.game3Result === 'P2_WIN') p2Games++;
          result = `${p1Games} - ${p2Games} (به نفع ${m.winnerId === m.player1Id ? p1Name : p2Name})`;
        } else {
          if (m.game1Result === 'P1_WIN') result = `برد ${p1Name}`;
          else if (m.game1Result === 'P2_WIN') result = `برد ${p2Name}`;
          else if (m.game1Result === 'DRAW') result = 'مساوی';
        }
        return {
          dayNumber: m.dayNumber,
          player1: p1Name,
          player2: p2Name,
          type: m.matchType === 'tiebreaker' ? 'تساوی‌شکن اضطراری' : m.isPlayoff ? 'پلی‌آف' : 'گروهی',
          result,
        };
      });

    try {
      const response = await fetch('/api/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastMatch: lastMatchStats,
          nextMatch: nextMatchStats,
          standings: standingsSummary,
          history: historyData
        })
      });

      if (!response.ok) {
        throw new Error('سیستم گزارش‌دهی کمی با لک مواجه شد.');
      }

      const data = await response.json();
      
      const newCommentary: CommentaryData = {
        lastMatchComment: data.lastMatchComment,
        nextMatchComment: data.nextMatchComment,
        hash: currentHash
      };

      setCommentary(newCommentary);
      localStorage.setItem('chess_news_cache', JSON.stringify(newCommentary));
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'مشکلی در برقراری ارتباط با جمینی پیش آمد.');
    } finally {
      setLoading(false);
    }
  };

  if (!state.isStarted) return null;

  return (
    <Card variant="neon" className="relative overflow-hidden border-blue-500/10 bg-slate-900/60 p-0 text-right">
      {/* Background Decorative Graphic Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-15%] w-[45%] h-[45%] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Retro Newspaper Header Masthead */}
      <div className="border-b border-white/10 px-6 py-4 bg-slate-950/40 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Newspaper className="w-5 h-5 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
            </div>
            <div>
              <div className="text-[10px] text-blue-400 font-extrabold tracking-widest uppercase font-mono">Z-News Chess Journal</div>
              <h2 className="text-base font-black text-slate-100 mt-0.5">روزنامه زت‌نیوز: تحلیل فوق هوشمند شفرنج</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[10px] bg-white/5 border border-white/10 text-slate-400 font-mono font-bold px-2.5 py-1.5 rounded-lg">
              نسخه #{completedMatchesCount + 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateCommentary()}
              disabled={loading}
              className="text-xs h-9 font-bold flex items-center gap-1.5 bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
              <span>تحلیل مجدد جمینی</span>
            </Button>
          </div>

        </div>
      </div>

      {/* Retro News Layout Line Marks */}
      <div className="w-full h-1 border-y border-white/10 bg-slate-950/20" />

      {/* Main Newspaper Grid */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-dashed border-blue-500/30 animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-blue-400 animate-pulse" />
                </div>
              </div>
              <h4 className="text-sm font-black text-slate-200">{LOADING_PHRASES[phraseIndex]}</h4>
              <p className="text-[10px] text-slate-500 mt-2 font-mono">گزارش نسل زدی در حال پخت با عطر چای و زعفرون...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 justify-center py-8 text-rose-400 text-xs font-bold"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
              <Button size="sm" variant="outline" onClick={() => generateCommentary()} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/20 font-extrabold pr-2 pl-2 cursor-pointer">تلاش مجدد</Button>
            </motion.div>
          ) : commentary ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-white/5"
            >
              
              {/* Column 1: Last Match Review */}
              <div className="space-y-4 pb-6 lg:pb-0">
                <div className="flex items-center justify-between border-b border-dashed border-white/5 pb-2">
                  <div className="flex items-center gap-1.5 text-xs text-blue-300 font-extrabold">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>آی ممد جعفر شطرنج! (رویداد آخر)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">بخش حوادث و فکت‌های سم</span>
                </div>
                
                <div className="relative group p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                  <span className="absolute -top-3 right-6 px-2 py-0.5 bg-slate-900 border border-white/10 text-[9px] text-slate-400 font-bold rounded">تیتر داغ</span>
                  <Quote className="absolute -bottom-2 -left-1 w-12 h-12 text-slate-800/10 transform rotate-180 pointer-events-none" />
                  
                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium mt-1 pr-1 font-sans">
                    {commentary.lastMatchComment}
                  </p>
                </div>
              </div>

              {/* Column 2: Next Match Predictions */}
              <div className="space-y-4 pt-6 lg:pt-0 lg:pl-8">
                <div className="flex items-center justify-between border-b border-dashed border-white/5 pb-2">
                  <div className="flex items-center gap-1.5 text-xs text-purple-300 font-extrabold">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>کری‌خوانی و جنگ تن‌به‌تن بعدی</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">پیش‌بینی زلزله روی تخته</span>
                </div>

                <div className="relative group p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                  <span className="absolute -top-3 right-6 px-2 py-0.5 bg-slate-900 border border-white/10 text-[9px] text-slate-400 font-bold rounded">خبر ویژه</span>
                  <Quote className="absolute -bottom-2 -left-1 w-12 h-12 text-slate-800/10 transform rotate-180 pointer-events-none" />
                  
                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium mt-1 pr-1 font-sans">
                    {commentary.nextMatchComment}
                  </p>
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400 text-xs">
              <HelpCircle className="w-7 h-7 text-slate-500 mb-2" />
              <span>آماده‌اید جنگ شوالیه‌ها را رصد کنید؟</span>
              <p className="text-[10px] text-slate-500 mt-1">اولین نتایج را ثبت کنید تا روزنامه زت‌نیوز منتشر شود!</p>
            </div>
          )}
        </AnimatePresence>

        {/* Column divider footer lines */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500 font-semibold select-none font-mono">
          <span>— خبرگزاری و تحریریه زت‌نیوز (Z-News Board)</span>
          <span>صفحه ۱ از ۱ شطرنج ژورنال</span>
        </div>
      </div>
    </Card>
  );
};
