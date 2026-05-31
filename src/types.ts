/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameResult = 'P1_WIN' | 'P2_WIN' | 'DRAW' | 'PENDING';

export interface Player {
  id: string;
  name: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrew: number;
  points: number; // 1 for match win, 0 for match loss
  avatarSeed: string; // for custom avatars
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  dayNumber: number; // 1-indexed
  dateStr: string; // Formatting like "۱۴۰۵/۰۳/۱۰"
  weekdayStr: string; // Day name in Persian (یکشنبه, دوشنبه, ...)
  game1Result: GameResult;
  game2Result: GameResult;
  game3Result: GameResult; // For tie-breakers, defaults to PENDING
  status: 'scheduled' | 'completed';
  winnerId: string | null;
  p1Points: number; // calculated points
  p2Points: number; // calculated points
  isPlayoff: boolean;
  playoffType?: 'final' | 'third_place';
  matchType?: 'went' | 'returned' | 'tiebreaker' | 'playoff';
}

export interface TournamentState {
  players: Player[];
  matches: Match[];
  isStarted: boolean;
  playoffStarted: boolean;
  playoffMatches: {
    final: Match | null;
    thirdPlace: Match | null;
  };
}
