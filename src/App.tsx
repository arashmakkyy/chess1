/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, Match, TournamentState, GameResult } from './types';
import { createRoundRobinSchedule, getNextSunday, formatPersianDate, generateMatchDates } from './utils/scheduler';
import { Button } from './components/common/Button';
import { Card } from './components/common/Card';
import { HeroSection } from './components/HeroSection';
import { Leaderboard } from './components/tournament/Leaderboard';
import { PlayerCard } from './components/player/PlayerCard';
import { FixtureList } from './components/tournament/FixtureList';
import { PlayoffBracket } from './components/tournament/PlayoffBracket';
import { Podium } from './components/tournament/Podium';
import { StatsDashboard } from './components/analytics/StatsDashboard';
import { ScoreEditor } from './components/tournament/ScoreEditor';
import { AiNewspaper } from './components/tournament/AiNewspaper';
import { Trophy, RefreshCw, Calendar, TrendingUp, HelpCircle, Star, Sparkles, Swords, LayoutDashboard } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'chess_league_state_v2';

const initialPlayers: Player[] = [
  { id: 'arash', name: 'آرش', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'arash' },
  { id: 'alireza', name: 'علیرضا', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'alireza' },
  { id: 'mohammad', name: 'محمد', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'mohammad' },
  { id: 'mehrdad', name: 'مهرداد', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'mehrdad' }
];

// Dynamically updates/adds/removes the Tiebreaker matches if group stage legs are completed and tied in head-to-head score
const updateTiebreakers = (matchesList: Match[], playersList: Player[]): Match[] => {
  const regularMatches = matchesList.filter(m => !m.isPlayoff && m.matchType !== 'tiebreaker');
  const existingTiebreakers = matchesList.filter(m => !m.isPlayoff && m.matchType === 'tiebreaker');
  
  const playerIds = playersList.map(p => p.id);
  const pairings: Array<[string, string]> = [];
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      pairings.push([playerIds[i], playerIds[j]]);
    }
  }

  const newTiebreakers: Match[] = [];

  pairings.forEach(([pA, pB]) => {
    // Find the Leg 1 and Leg 2 regular matches between pA and pB
    const legs = regularMatches.filter(m => 
      (m.player1Id === pA && m.player2Id === pB) || (m.player1Id === pB && m.player2Id === pA)
    );

    if (legs.length === 2 && legs[0].status === 'completed' && legs[1].status === 'completed') {
      let pAPoints = 0;
      let pBPoints = 0;

      legs.forEach(leg => {
        if (leg.winnerId === pA) pAPoints += 1;
        else if (leg.winnerId === pB) pBPoints += 1;
        else if (leg.game1Result === 'DRAW') {
          pAPoints += 0.5;
          pBPoints += 0.5;
        }
      });

      if (pAPoints === pBPoints) {
        // Tied overall in both legs! We require an emergency tiebreak match.
        const existingTb = existingTiebreakers.find(m => 
          (m.player1Id === pA && m.player2Id === pB) || (m.player1Id === pB && m.player2Id === pA)
        );

        if (existingTb) {
          newTiebreakers.push(existingTb);
        } else {
          newTiebreakers.push({
            id: `tiebreaker_${pA}_${pB}`,
            player1Id: pA,
            player2Id: pB,
            dayNumber: 0,
            dateStr: '',
            weekdayStr: '',
            game1Result: 'PENDING',
            game2Result: 'PENDING',
            game3Result: 'PENDING',
            status: 'scheduled',
            winnerId: null,
            p1Points: 0,
            p2Points: 0,
            isPlayoff: false,
            matchType: 'tiebreaker'
          });
        }
      }
    }
  });

  const combinedGroupStage = [...regularMatches, ...newTiebreakers];

  const baseDate = new Date('2026-05-30T10:00:00Z');
  const startSunday = getNextSunday(baseDate);
  const matchDates = generateMatchDates(startSunday, combinedGroupStage.length);

  return combinedGroupStage.map((match, index) => {
    const dateInfo = matchDates[index];
    return {
      ...match,
      dayNumber: index + 1,
      dateStr: dateInfo.dateStr,
      weekdayStr: dateInfo.weekdayStr
    };
  });
};

export default function App() {
  const [state, setState] = useState<TournamentState>({
    players: initialPlayers,
    matches: [],
    isStarted: false,
    playoffStarted: false,
    playoffMatches: {
      final: null,
      thirdPlace: null
    }
  });

  const [activeTab, setActiveTab] = useState<'fixtures' | 'rankings' | 'playoffs' | 'analytics'>('fixtures');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (e) {
        console.error('Failed to parse saved tournament state', e);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  const saveState = (newState: TournamentState) => {
    setState(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  };

  // 1. Action: Start Tournament (Lottery Draw)
  const handleStartTournament = () => {
    // Start matches from tomorrow (Sunday) - relative to current mock time 2026-05-30 (which is Sat)
    const baseDate = new Date('2026-05-30T10:00:00Z');
    const startSunday = getNextSunday(baseDate);
    
    // Create random double round-robin schedule
    const matches = createRoundRobinSchedule(state.players, startSunday);
    
    // Reset player scores just in case
    const resetPlayers = initialPlayers.map(p => ({ ...p }));

    saveState({
      players: resetPlayers,
      matches,
      isStarted: true,
      playoffStarted: false,
      playoffMatches: {
        final: null,
        thirdPlace: null
      }
    });
  };

  // 2. Action: Recalculate group-stage standing of players based on match scores
  const recalculatePlayers = (matches: Match[]): Player[] => {
    // Create deep copy of initial players
    const updatedPlayers = initialPlayers.map(p => ({
      ...p,
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      gamesWon: 0,
      gamesLost: 0,
      gamesDrew: 0,
      points: 0
    }));

    // Go through all group stage matches that are completed
    matches.filter(m => !m.isPlayoff && m.status === 'completed').forEach(match => {
      const p1 = updatedPlayers.find(p => p.id === match.player1Id);
      const p2 = updatedPlayers.find(p => p.id === match.player2Id);

      if (p1 && p2) {
        p1.matchesPlayed++;
        p2.matchesPlayed++;

        // Since each match is a single game:
        if (match.game1Result === 'P1_WIN') {
          p1.points += 1;
          p1.matchesWon++;
          p1.gamesWon++;
          
          p2.matchesLost++;
          p2.gamesLost++;
        } else if (match.game1Result === 'P2_WIN') {
          p2.points += 1;
          p2.matchesWon++;
          p2.gamesWon++;
          
          p1.matchesLost++;
          p1.gamesLost++;
        } else if (match.game1Result === 'DRAW') {
          p1.points += 0.5;
          p2.points += 0.5;
          p1.gamesDrew++;
          p2.gamesDrew++;
        }
      }
    });

    return updatedPlayers;
  };

  // 3. Action: Handle saving score (both Group and Playoffs)
  const handleSaveMatchScore = (
    matchId: string,
    g1: GameResult,
    g2: GameResult,
    g3: GameResult,
    isPlayoff: boolean
  ) => {
    if (!isPlayoff) {
      // 3a. Save Group stage match
      const updatedMatchesRaw = state.matches.map(m => {
        if (m.id === matchId) {
          // Calculate individual match winner id
          let winnerId: string | null = null;
          let p1PointsAwarded = 0;
          let p2PointsAwarded = 0;

          if (g1 === 'P1_WIN') {
            winnerId = m.player1Id;
            p1PointsAwarded = 1;
            p2PointsAwarded = 0;
          } else if (g1 === 'P2_WIN') {
            winnerId = m.player2Id;
            p1PointsAwarded = 0;
            p2PointsAwarded = 1;
          } else if (g1 === 'DRAW') {
            winnerId = null;
            p1PointsAwarded = 0.5;
            p2PointsAwarded = 0.5;
          }

          return {
            ...m,
            game1Result: g1,
            game2Result: 'PENDING' as const,
            game3Result: 'PENDING' as const,
            status: 'completed' as const,
            winnerId,
            p1Points: p1PointsAwarded,
            p2Points: p2PointsAwarded
          };
        }
        return m;
      });

      // Recalculate and update tie-breakers dynamically
      const updatedMatchesWithTiebreakers = updateTiebreakers(updatedMatchesRaw, state.players);

      // Recalculate standings based on this finalized combined match list
      const updatedPlayers = recalculatePlayers(updatedMatchesWithTiebreakers);

      // Save state
      saveState({
        ...state,
        matches: updatedMatchesWithTiebreakers,
        players: updatedPlayers
      });
    } else {
      // 3b. Save Playoff match
      const pMatches = { ...state.playoffMatches };
      let finalWinnerId: string | null = null;

      if (pMatches.final && pMatches.final.id === matchId) {
        let p1GamePoints = 0;
        let p2GamePoints = 0;

        if (g1 === 'P1_WIN') p1GamePoints += 1;
        if (g1 === 'DRAW') { p1GamePoints += 0.5; p2GamePoints += 0.5; }
        if (g1 === 'P2_WIN') p2GamePoints += 1;

        if (g2 === 'P1_WIN') p1GamePoints += 1;
        if (g2 === 'DRAW') { p1GamePoints += 0.5; p2GamePoints += 0.5; }
        if (g2 === 'P2_WIN') p2GamePoints += 1;

        if (p1GamePoints > p2GamePoints) {
          finalWinnerId = pMatches.final.player1Id;
        } else if (p2GamePoints > p1GamePoints) {
          finalWinnerId = pMatches.final.player2Id;
        } else {
          if (g3 === 'P1_WIN') finalWinnerId = pMatches.final.player1Id;
          else if (g3 === 'P2_WIN') finalWinnerId = pMatches.final.player2Id;
        }

        pMatches.final = {
          ...pMatches.final,
          game1Result: g1,
          game2Result: g2,
          game3Result: g3,
          status: 'completed',
          winnerId: finalWinnerId
        };
      }

      if (pMatches.thirdPlace && pMatches.thirdPlace.id === matchId) {
        let p1GamePoints = 0;
        let p2GamePoints = 0;

        if (g1 === 'P1_WIN') p1GamePoints += 1;
        if (g1 === 'DRAW') { p1GamePoints += 0.5; p2GamePoints += 0.5; }
        if (g1 === 'P2_WIN') p2GamePoints += 1;

        if (g2 === 'P1_WIN') p1GamePoints += 1;
        if (g2 === 'DRAW') { p1GamePoints += 0.5; p2GamePoints += 0.5; }
        if (g2 === 'P2_WIN') p2GamePoints += 1;

        if (p1GamePoints > p2GamePoints) {
          finalWinnerId = pMatches.thirdPlace.player1Id;
        } else if (p2GamePoints > p1GamePoints) {
          finalWinnerId = pMatches.thirdPlace.player2Id;
        } else {
          if (g3 === 'P1_WIN') finalWinnerId = pMatches.thirdPlace.player1Id;
          else if (g3 === 'P2_WIN') finalWinnerId = pMatches.thirdPlace.player2Id;
        }

        pMatches.thirdPlace = {
          ...pMatches.thirdPlace,
          game1Result: g1,
          game2Result: g2,
          game3Result: g3,
          status: 'completed',
          winnerId: finalWinnerId
        };
      }

      saveState({
        ...state,
        playoffMatches: pMatches
      });
    }

    setSelectedMatch(null);
  };

  // 3c. Swap two matches sequence in group-stage
  const handleSwapMatches = (matchIdA: string, matchIdB: string) => {
    const currentMatches = [...state.matches];
    const indexA = currentMatches.findIndex(m => m.id === matchIdA);
    const indexB = currentMatches.findIndex(m => m.id === matchIdB);

    if (indexA !== -1 && indexB !== -1) {
      const temp = currentMatches[indexA];
      currentMatches[indexA] = currentMatches[indexB];
      currentMatches[indexB] = temp;

      // Update dates and day numbers
      const updatedMatchesWithDates = updateTiebreakers(currentMatches, state.players);
      const updatedPlayers = recalculatePlayers(updatedMatchesWithDates);

      saveState({
        ...state,
        matches: updatedMatchesWithDates,
        players: updatedPlayers
      });
    }
  };

  // 4. Action: Start Playoffs (Lock brackets)
  const handleStartPlayoffs = () => {
    // Sort final group phase standings to determine matchups
    const sortedGroupStandings = [...state.players].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
      return b.gamesWon - a.gamesWon;
    });

    const rank1 = sortedGroupStandings[0];
    const rank2 = sortedGroupStandings[1];
    const rank3 = sortedGroupStandings[2];
    const rank4 = sortedGroupStandings[3];

    // Dates for playoffs (played after all group stage and tiebreak matches)
    const baseDate = new Date('2026-05-30T10:00:00Z');
    const startSunday = getNextSunday(baseDate);
    const totalGroupMatches = state.matches.length;
    const allExpectedDates = generateMatchDates(startSunday, totalGroupMatches + 2);
    
    const thirdPlaceDateInfo = allExpectedDates[totalGroupMatches];
    const finalDateInfo = allExpectedDates[totalGroupMatches + 1];

    const thirdPlaceMatch: Match = {
      id: 'playoff_third_place',
      player1Id: rank3.id,
      player2Id: rank4.id,
      dayNumber: totalGroupMatches + 1,
      dateStr: thirdPlaceDateInfo.dateStr,
      weekdayStr: thirdPlaceDateInfo.weekdayStr,
      game1Result: 'PENDING',
      game2Result: 'PENDING',
      game3Result: 'PENDING',
      status: 'scheduled',
      winnerId: null,
      p1Points: 0,
      p2Points: 0,
      isPlayoff: true,
      playoffType: 'third_place',
      matchType: 'playoff'
    };

    const finalMatch: Match = {
      id: 'playoff_final',
      player1Id: rank1.id,
      player2Id: rank2.id,
      dayNumber: totalGroupMatches + 2,
      dateStr: finalDateInfo.dateStr,
      weekdayStr: finalDateInfo.weekdayStr,
      game1Result: 'PENDING',
      game2Result: 'PENDING',
      game3Result: 'PENDING',
      status: 'scheduled',
      winnerId: null,
      p1Points: 0,
      p2Points: 0,
      isPlayoff: true,
      playoffType: 'final',
      matchType: 'playoff'
    };

    saveState({
      ...state,
      playoffStarted: true,
      playoffMatches: {
        final: finalMatch,
        thirdPlace: thirdPlaceMatch
      }
    });

    setActiveTab('playoffs');
  };

  // 5. Action: Full reset
  const handleResetTournament = () => {
    if (confirm('آیا از شروع مجدد لیگ و حذف تمام برنامه بازی‌ها و نتایج اطمینان دارید؟')) {
      const resetPlayers = initialPlayers.map(p => ({ ...p }));
      saveState({
        players: resetPlayers,
        matches: [],
        isStarted: false,
        playoffStarted: false,
        playoffMatches: {
          final: null,
          thirdPlace: null
        }
      });
      setActiveTab('fixtures');
    }
  };

  const allGroupMatchesCompleted = 
    state.matches.length > 0 && 
    state.matches.every(m => m.status === 'completed');

  const isPlayoffsCompleted = 
    state.playoffStarted && 
    state.playoffMatches.final?.status === 'completed' && 
    state.playoffMatches.thirdPlace?.status === 'completed';

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans select-none pb-12 overflow-x-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-purple-600/15 rounded-full blur-[130px] pointer-events-none"></div>
      
      {/* Dynamic Top bar brand */}
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/10 px-4 md:px-10 py-4 flex items-center justify-between text-right">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          </div>
          <span className="font-bold text-base md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">لیگ شطرنج شوالیه‌ها</span>
        </div>

        {state.isStarted && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetTournament}
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-slate-100 text-[11px] md:text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ریست و قرعه‌کشی مجدد</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        
        {!state.isStarted ? (
          /* Introduction landing phase with players cards and lottery triggers */
          <HeroSection
            players={state.players}
            onStartTournament={handleStartTournament}
          />
        ) : (
          /* Main active state workspace dashboard */
          <div className="space-y-8">
            
            {/* AI Generation Gen Z Live Newspaper Commentary Section */}
            <AiNewspaper state={state} />

            {/* Playoff Victory podium spotlight banner */}
            {isPlayoffsCompleted && (
              <Podium
                players={state.players}
                finalMatch={state.playoffMatches.final}
                thirdPlaceMatch={state.playoffMatches.thirdPlace}
              />
            )}

            {/* If all group matches are done but playoffs are NOT started, show explicit unlock panel */}
            {allGroupMatchesCompleted && !state.playoffStarted && (
              <Card variant="glow-gold" className="border-amber-500/20 text-center py-8">
                <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-bounce" />
                <h2 className="text-xl font-bold text-zinc-100 mb-2">دور گروهی با موفقیت به پایان رسید!</h2>
                <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
                  تمامی ۱۲ فیکسچر جدول مقدماتی ایفا شده و رتبه‌بندی نهایی معین گردید؛ آرش، علیرضا، محمد و مهرداد آماده فینال و بازی رده‌بندی سومی و چهارمی هستند. مرحله نهایی پلی‌آف را همین حالا استارت بزنید!
                </p>
                <Button
                  variant="glow"
                  onClick={handleStartPlayoffs}
                  className="px-8 py-3 shadow-[0_0_20px_rgba(245,158,11,0.2)] font-black text-sm"
                >
                  ⚔️ شروع مرحله نهایی پلی‌آف حذفی
                </Button>
              </Card>
            )}

            {/* Dashboard Tabs & Navigation header */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md overflow-x-auto justify-start select-none">
              
              <button
                onClick={() => setActiveTab('fixtures')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'fixtures'
                    ? 'bg-white/10 border border-white/10 text-white shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>برنامه و نتایج فیکسچرها</span>
              </button>

              <button
                onClick={() => setActiveTab('rankings')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'rankings'
                    ? 'bg-white/10 border border-white/10 text-white shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                <span>جدول رده‌بندی و بازیکنان</span>
              </button>

              <button
                onClick={() => setActiveTab('playoffs')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'playoffs'
                    ? 'bg-white/10 border border-white/10 text-white shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>مرحله نهایی حذفی (پلی‌آف)</span>
                {state.playoffStarted && !isPlayoffsCompleted && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-white/10 border border-white/10 text-white shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <span>تحلیل آماری و نمودارها</span>
              </button>
            </div>

            {/* Dashboard Workspace Rendering Views */}
            <div className="min-h-[400px]">
              
              {activeTab === 'fixtures' && (
                <FixtureList
                  matches={state.matches}
                  players={state.players}
                  onEditScore={setSelectedMatch}
                  onSwapMatches={handleSwapMatches}
                />
              )}

              {activeTab === 'rankings' && (
                <div className="space-y-8">
                  {/* Standing table */}
                  <Leaderboard players={state.players} />

                  {/* Player Cards ledger */}
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-500 border-b border-zinc-900 pb-3 mb-6 pr-1">
                      شناسنامه عملکرد فنی شوالیه‌ها
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {state.players.map((player, idx) => {
                        // Find dynamic rank of this player
                        const sorted = [...state.players].sort((a, b) => {
                          if (b.points !== a.points) return b.points - a.points;
                          if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
                          return b.gamesWon - a.gamesWon;
                        });
                        const rank = sorted.findIndex(p => p.id === player.id) + 1;

                        return (
                          <PlayerCard
                            key={player.id}
                            player={player}
                            rank={rank}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'playoffs' && (
                <PlayoffBracket
                  players={state.players}
                  finalMatch={state.playoffMatches.final}
                  thirdPlaceMatch={state.playoffMatches.thirdPlace}
                  onEditScore={setSelectedMatch}
                  onStartPlayoffs={handleStartPlayoffs}
                />
              )}

              {activeTab === 'analytics' && (
                <StatsDashboard players={state.players} />
              )}
            </div>

            {/* Modal - Score editor */}
            {selectedMatch && (
              <ScoreEditor
                match={selectedMatch}
                players={state.players}
                onSave={handleSaveMatchScore}
                onClose={() => setSelectedMatch(null)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
