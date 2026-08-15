/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Player,
  Match,
  TournamentState,
  GameResult,
  GroupIdentifier
} from './types';
import {
  createTwoGroupSingleRoundRobinSchedule,
  getNextSunday
} from './utils/scheduler';
import { useTournamentSync } from './hooks/useTournamentSync';
import { useAdminAuth } from './hooks/useAdminAuth';
import { HeaderControls } from './components/common/HeaderControls';
import { AdminPasscodeModal } from './components/auth/AdminPasscodeModal';
import { AdminBannerNotice } from './components/auth/AdminBannerNotice';
import { HeroSection } from './components/HeroSection';
import { Leaderboard } from './components/tournament/Leaderboard';
import { FixtureList } from './components/tournament/FixtureList';
import { PlayoffBracket } from './components/tournament/PlayoffBracket';
import { Podium } from './components/tournament/Podium';
import { ScoreEditor } from './components/tournament/ScoreEditor';
import { StatsDashboard } from './components/analytics/StatsDashboard';
import { AiNewspaper } from './components/tournament/AiNewspaper';
import { PlayerCard } from './components/player/PlayerCard';
import {
  Trophy,
  CalendarDays,
  GitBranch,
  BarChart3,
  Newspaper,
  Users
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'tables' | 'fixtures' | 'playoffs' | 'players' | 'stats' | 'newspaper'
  >('tables');

  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const {
    state,
    setState,
    syncStatus,
    lastSyncTime,
    refreshFromServer,
    resetTournament
  } = useTournamentSync();

  const {
    isAdmin,
    isAuthModalOpen,
    actionTitle,
    login,
    logout,
    requireAdmin,
    cancelAuth,
    openLoginModal
  } = useAdminAuth();

  // Web Audio Synthesizer for celebration sound
  const playVictorySound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  // Shuffle players into 2 balanced random groups of 5
  const handleShuffleGroups = () => {
    requireAdmin('قرعه‌کشی مجدد گروه‌ها', () => {
      const shuffled = [...state.players].sort(() => Math.random() - 0.5);
      const updatedPlayers = shuffled.map((player, index) => ({
        ...player,
        group: (index < 5 ? 'A' : 'B') as GroupIdentifier
      }));

      setState((prev) => ({
        ...prev,
        players: updatedPlayers
      }));
    });
  };

  // Start the tournament & generate the schedule
  const handleStartTournament = () => {
    requireAdmin('شروع رسمی لیگ و ایجاد تقویم بازی‌ها', () => {
      const nextSunday = getNextSunday(new Date());
      const generatedMatches = createTwoGroupSingleRoundRobinSchedule(
        state.players,
        nextSunday
      );

      // Reset player scores
      const resetPlayers = state.players.map((p) => ({
        ...p,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        gamesWon: 0,
        gamesLost: 0,
        gamesDrew: 0,
        points: 0
      }));

      setState((prev) => ({
        ...prev,
        players: resetPlayers,
        matches: generatedMatches,
        isStarted: true,
        playoffStarted: false,
        playoffMatches: {
          semiFinal1: null,
          semiFinal2: null,
          final: null,
          thirdPlace: null
        }
      }));

      setActiveTab('fixtures');
    });
  };

  // Recalculate standings from all completed matches
  const recalculateStandings = (matches: Match[], players: Player[]): Player[] => {
    const statsMap: Record<
      string,
      {
        matchesPlayed: number;
        matchesWon: number;
        matchesLost: number;
        gamesWon: number;
        gamesLost: number;
        gamesDrew: number;
        points: number;
      }
    > = {};

    players.forEach((p) => {
      statsMap[p.id] = {
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        gamesWon: 0,
        gamesLost: 0,
        gamesDrew: 0,
        points: 0
      };
    });

    matches.forEach((m) => {
      if (m.status === 'completed' && !m.isPlayoff) {
        const p1Stats = statsMap[m.player1Id];
        const p2Stats = statsMap[m.player2Id];

        if (p1Stats && p2Stats) {
          p1Stats.matchesPlayed += 1;
          p2Stats.matchesPlayed += 1;

          p1Stats.points += m.p1Points;
          p2Stats.points += m.p2Points;

          if (m.game1Result === 'P1_WIN') {
            p1Stats.matchesWon += 1;
            p1Stats.gamesWon += 1;
            p2Stats.matchesLost += 1;
            p2Stats.gamesLost += 1;
          } else if (m.game1Result === 'P2_WIN') {
            p2Stats.matchesWon += 1;
            p2Stats.gamesWon += 1;
            p1Stats.matchesLost += 1;
            p1Stats.gamesLost += 1;
          } else if (m.game1Result === 'DRAW') {
            p1Stats.gamesDrew += 1;
            p2Stats.gamesDrew += 1;
          }
        }
      }
    });

    return players.map((p) => ({
      ...p,
      ...statsMap[p.id]
    }));
  };

  // Unlock and setup Playoffs when group stage finishes or is activated
  const setupPlayoffsIfNeeded = (updatedPlayers: Player[], currentMatches: Match[]) => {
    const groupAPlayers = updatedPlayers
      .filter((p) => p.group === 'A')
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
        return b.gamesWon - a.gamesWon;
      });

    const groupBPlayers = updatedPlayers
      .filter((p) => p.group === 'B')
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
        return b.gamesWon - a.gamesWon;
      });

    const a1 = groupAPlayers[0];
    const a2 = groupAPlayers[1];
    const b1 = groupBPlayers[0];
    const b2 = groupBPlayers[1];

    if (!a1 || !a2 || !b1 || !b2) return;

    const lastGroupMatch = currentMatches[currentMatches.length - 1];
    const lastDayNumber = lastGroupMatch ? lastGroupMatch.dayNumber : 20;

    // Semi Final 1: 1st of A vs 2nd of B (ضربدری)
    const semiFinal1: Match = {
      id: 'playoff_semi_1',
      player1Id: a1.id,
      player2Id: b2.id,
      dayNumber: lastDayNumber + 1,
      dateStr: 'روز بعد از گروهی',
      weekdayStr: 'نیمه‌نهایی ۱',
      game1Result: 'PENDING',
      game2Result: 'PENDING',
      game3Result: 'PENDING',
      status: 'scheduled',
      winnerId: null,
      p1Points: 0,
      p2Points: 0,
      isPlayoff: true,
      playoffStage: 'semi_final_1',
      matchType: 'semi_final'
    };

    // Semi Final 2: 1st of B vs 2nd of A (ضربدری)
    const semiFinal2: Match = {
      id: 'playoff_semi_2',
      player1Id: b1.id,
      player2Id: a2.id,
      dayNumber: lastDayNumber + 2,
      dateStr: 'روز بعد از گروهی',
      weekdayStr: 'نیمه‌نهایی ۲',
      game1Result: 'PENDING',
      game2Result: 'PENDING',
      game3Result: 'PENDING',
      status: 'scheduled',
      winnerId: null,
      p1Points: 0,
      p2Points: 0,
      isPlayoff: true,
      playoffStage: 'semi_final_2',
      matchType: 'semi_final'
    };

    // Grand Final Template
    const final: Match = {
      id: 'playoff_final',
      player1Id: '',
      player2Id: '',
      dayNumber: lastDayNumber + 3,
      dateStr: 'روز فینال',
      weekdayStr: 'فینال قهرمانی',
      game1Result: 'PENDING',
      game2Result: 'PENDING',
      game3Result: 'PENDING',
      status: 'scheduled',
      winnerId: null,
      p1Points: 0,
      p2Points: 0,
      isPlayoff: true,
      playoffStage: 'final',
      matchType: 'final'
    };

    // 3rd Place Match Template
    const thirdPlace: Match = {
      id: 'playoff_third_place',
      player1Id: '',
      player2Id: '',
      dayNumber: lastDayNumber + 3,
      dateStr: 'روز رده‌بندی',
      weekdayStr: 'دیدار رده‌بندی',
      game1Result: 'PENDING',
      game2Result: 'PENDING',
      game3Result: 'PENDING',
      status: 'scheduled',
      winnerId: null,
      p1Points: 0,
      p2Points: 0,
      isPlayoff: true,
      playoffStage: 'third_place',
      matchType: 'third_place'
    };

    setState((prev) => ({
      ...prev,
      playoffStarted: true,
      playoffMatches: {
        semiFinal1,
        semiFinal2,
        final,
        thirdPlace
      }
    }));
  };

  // Save match score
  const handleSaveScore = (
    matchId: string,
    game1: GameResult,
    game2: GameResult,
    game3: GameResult,
    isPlayoff: boolean
  ) => {
    playVictorySound();

    if (!isPlayoff) {
      // Group Stage Match
      const updatedMatches = state.matches.map((m) => {
        if (m.id !== matchId) return m;

        let p1Points = 0;
        let p2Points = 0;
        let winnerId: string | null = null;

        if (game1 === 'P1_WIN') {
          p1Points = 1;
          p2Points = 0;
          winnerId = m.player1Id;
        } else if (game1 === 'P2_WIN') {
          p1Points = 0;
          p2Points = 1;
          winnerId = m.player2Id;
        } else if (game1 === 'DRAW') {
          p1Points = 0.5;
          p2Points = 0.5;
          winnerId = null;
        }

        return {
          ...m,
          game1Result: game1,
          p1Points,
          p2Points,
          winnerId,
          status: 'completed' as const
        };
      });

      const updatedPlayers = recalculateStandings(updatedMatches, state.players);

      // Check if all 20 group matches are completed
      const allGroupMatchesCompleted = updatedMatches.every(
        (m) => m.status === 'completed'
      );

      setState((prev) => ({
        ...prev,
        matches: updatedMatches,
        players: updatedPlayers
      }));

      // Automatically initialize playoffs if all group matches are done
      if (allGroupMatchesCompleted && !state.playoffStarted) {
        setupPlayoffsIfNeeded(updatedPlayers, updatedMatches);
      }
    } else {
      // Playoff Match
      const { semiFinal1, semiFinal2, final, thirdPlace } = state.playoffMatches;

      let newSemi1 = semiFinal1 ? { ...semiFinal1 } : null;
      let newSemi2 = semiFinal2 ? { ...semiFinal2 } : null;
      let newFinal = final ? { ...final } : null;
      let newThirdPlace = thirdPlace ? { ...thirdPlace } : null;

      if (matchId === 'playoff_semi_1' && newSemi1) {
        let winnerId: string = newSemi1.player1Id;
        if (game1 === 'P1_WIN') winnerId = newSemi1.player1Id;
        else if (game1 === 'P2_WIN') winnerId = newSemi1.player2Id;
        else if (game1 === 'DRAW') {
          winnerId = game2 === 'P1_WIN' ? newSemi1.player1Id : newSemi1.player2Id;
        }

        newSemi1 = {
          ...newSemi1,
          game1Result: game1,
          game2Result: game2,
          winnerId,
          status: 'completed'
        };
      } else if (matchId === 'playoff_semi_2' && newSemi2) {
        let winnerId: string = newSemi2.player1Id;
        if (game1 === 'P1_WIN') winnerId = newSemi2.player1Id;
        else if (game1 === 'P2_WIN') winnerId = newSemi2.player2Id;
        else if (game1 === 'DRAW') {
          winnerId = game2 === 'P1_WIN' ? newSemi2.player1Id : newSemi2.player2Id;
        }

        newSemi2 = {
          ...newSemi2,
          game1Result: game1,
          game2Result: game2,
          winnerId,
          status: 'completed'
        };
      } else if (matchId === 'playoff_final' && newFinal) {
        let winnerId: string = newFinal.player1Id;
        if (game1 === 'P1_WIN') winnerId = newFinal.player1Id;
        else if (game1 === 'P2_WIN') winnerId = newFinal.player2Id;
        else if (game1 === 'DRAW') {
          winnerId = game2 === 'P1_WIN' ? newFinal.player1Id : newFinal.player2Id;
        }

        newFinal = {
          ...newFinal,
          game1Result: game1,
          game2Result: game2,
          winnerId,
          status: 'completed'
        };
      } else if (matchId === 'playoff_third_place' && newThirdPlace) {
        let winnerId: string = newThirdPlace.player1Id;
        if (game1 === 'P1_WIN') winnerId = newThirdPlace.player1Id;
        else if (game1 === 'P2_WIN') winnerId = newThirdPlace.player2Id;
        else if (game1 === 'DRAW') {
          winnerId =
            game2 === 'P1_WIN' ? newThirdPlace.player1Id : newThirdPlace.player2Id;
        }

        newThirdPlace = {
          ...newThirdPlace,
          game1Result: game1,
          game2Result: game2,
          winnerId,
          status: 'completed'
        };
      }

      // If both semi finals are completed, populate the Final & 3rd Place matches!
      if (
        newSemi1?.status === 'completed' &&
        newSemi2?.status === 'completed' &&
        newFinal &&
        newThirdPlace
      ) {
        const winnerSemi1 = newSemi1.winnerId!;
        const loserSemi1 =
          newSemi1.player1Id === winnerSemi1 ? newSemi1.player2Id : newSemi1.player1Id;

        const winnerSemi2 = newSemi2.winnerId!;
        const loserSemi2 =
          newSemi2.player1Id === winnerSemi2 ? newSemi2.player2Id : newSemi2.player1Id;

        newFinal.player1Id = winnerSemi1;
        newFinal.player2Id = winnerSemi2;

        newThirdPlace.player1Id = loserSemi1;
        newThirdPlace.player2Id = loserSemi2;
      }

      setState((prev) => ({
        ...prev,
        playoffMatches: {
          semiFinal1: newSemi1,
          semiFinal2: newSemi2,
          final: newFinal,
          thirdPlace: newThirdPlace
        }
      }));
    }
  };

  // Swap matches if needed
  const handleSwapMatches = (matchIdA: string, matchIdB: string) => {
    requireAdmin('جابه‌جایی زمان برگزاری بازی‌ها', () => {
      setState((prev) => {
        const matchA = prev.matches.find((m) => m.id === matchIdA);
        const matchB = prev.matches.find((m) => m.id === matchIdB);

        if (!matchA || !matchB) return prev;

        const updatedMatches = prev.matches.map((m) => {
          if (m.id === matchIdA) {
            return {
              ...m,
              dayNumber: matchB.dayNumber,
              dateStr: matchB.dateStr,
              weekdayStr: matchB.weekdayStr
            };
          }
          if (m.id === matchIdB) {
            return {
              ...m,
              dayNumber: matchA.dayNumber,
              dateStr: matchA.dateStr,
              weekdayStr: matchA.weekdayStr
            };
          }
          return m;
        });

        updatedMatches.sort((a, b) => a.dayNumber - b.dayNumber);

        return {
          ...prev,
          matches: updatedMatches
        };
      });
    });
  };

  // Reset entire tournament
  const handleResetTournament = () => {
    requireAdmin('بازنشانی کامل تورنمنت', () => {
      if (
        window.confirm(
          'آیا از بازنشانی کامل لیگ و شروع مجدد با قرعه‌کشی جدید اطمینان دارید؟ تمام نتایج از سرور و حافظه پاک خواهند شد.'
        )
      ) {
        resetTournament();
        setActiveTab('tables');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 select-none overflow-x-hidden">
      {/* Top Ambient Light Accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Bar */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/80 border border-white/10 rounded-2xl p-4 mb-4 backdrop-blur-xl sticky top-4 z-40 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base md:text-lg font-black text-slate-100 tracking-tight">
                  لیگ برتر شطرنج (فصل جدید ۱۰ نفره)
                </h1>
                <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md">
                  ۲ گروه ➔ حذفی ضربدری
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                سیستم همگام‌سازی ابری زنده با بک‌اند، فیکسچرها و پلی‌آف نیمه‌نهایی و فینال
              </p>
            </div>
          </div>

          <HeaderControls
            syncStatus={syncStatus}
            lastSyncTime={lastSyncTime}
            isAdmin={isAdmin}
            onLoginClick={openLoginModal}
            onLogoutClick={logout}
            onRefresh={refreshFromServer}
            onReset={handleResetTournament}
          />
        </header>

        {/* Admin status notice banner */}
        <AdminBannerNotice isAdmin={isAdmin} onOpenLogin={openLoginModal} />

        {/* Hero Section */}
        <HeroSection
          players={state.players}
          isStarted={state.isStarted}
          onStartTournament={handleStartTournament}
          onShuffleGroups={handleShuffleGroups}
        />

        {/* Podium if playoffs finished */}
        {state.playoffMatches.final?.status === 'completed' &&
          state.playoffMatches.thirdPlace?.status === 'completed' && (
            <div className="mb-10">
              <Podium
                players={state.players}
                finalMatch={state.playoffMatches.final}
                thirdPlaceMatch={state.playoffMatches.thirdPlace}
              />
            </div>
          )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-start gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar border-b border-white/10">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'tables'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>جداول رده‌بندی ۲ گروه</span>
          </button>

          <button
            onClick={() => setActiveTab('fixtures')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'fixtures'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>برنامه فیکسچرها</span>
            {state.matches.length > 0 && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
                {state.matches.filter((m) => m.status === 'completed').length}/{state.matches.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('playoffs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'playoffs'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>درخت پلی‌آف و نیمه‌نهایی ضربدری</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
              مهم
            </span>
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'players'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>کارت‌های ۱۰ بازیکن</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>آمار تحلیلی و نمودارها</span>
          </button>

          <button
            onClick={() => setActiveTab('newspaper')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'newspaper'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>روزنامه هوش مصنوعی</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <main className="transition-all duration-300">
          {activeTab === 'tables' && (
            <div className="space-y-6">
              <Leaderboard players={state.players} />
            </div>
          )}

          {activeTab === 'fixtures' && (
            <FixtureList
              matches={state.matches}
              players={state.players}
              onEditScore={(match) =>
                requireAdmin('ثبت و ویرایش نتیجه بازی', () => setEditingMatch(match))
              }
              onSwapMatches={handleSwapMatches}
            />
          )}

          {activeTab === 'playoffs' && (
            <PlayoffBracket
              players={state.players}
              playoffMatches={state.playoffMatches}
              playoffStarted={state.playoffStarted}
              onEditScore={(match) =>
                requireAdmin('ثبت و ویرایش نتیجه مسابقه پلی‌آف', () => setEditingMatch(match))
              }
              onStartPlayoffs={() =>
                requireAdmin('شروع مرحله حذفی و پلی‌آف', () =>
                  setupPlayoffsIfNeeded(state.players, state.matches)
                )
              }
            />
          )}

          {activeTab === 'players' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {state.players.map((player, idx) => (
                  <PlayerCard key={player.id} player={player} rank={idx + 1} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <StatsDashboard players={state.players} matches={state.matches} />
          )}

          {activeTab === 'newspaper' && (
            <AiNewspaper
              players={state.players}
              matches={state.matches}
              playoffStarted={state.playoffStarted}
            />
          )}
        </main>

        {/* Score Editor Modal */}
        {editingMatch && (
          <ScoreEditor
            match={editingMatch}
            players={state.players}
            onSave={handleSaveScore}
            onClose={() => setEditingMatch(null)}
          />
        )}

        {/* Admin Passcode Modal */}
        <AdminPasscodeModal
          isOpen={isAuthModalOpen}
          actionTitle={actionTitle}
          onSuccess={login}
          onCancel={cancelAuth}
        />
      </div>
    </div>
  );
}

export default App;
