/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameResult = 'P1_WIN' | 'P2_WIN' | 'DRAW' | 'PENDING';

export type GroupIdentifier = 'A' | 'B';

export interface Player {
  id: string;
  name: string;
  group: GroupIdentifier;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrew: number;
  points: number; // 1 for win, 0.5 for draw, 0 for loss
  avatarSeed: string;
}

export type PlayoffStage = 'semi_final_1' | 'semi_final_2' | 'third_place' | 'final';

export type MatchType = 'group' | 'semi_final' | 'third_place' | 'final' | 'tiebreaker';

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  group?: GroupIdentifier;
  dayNumber: number; // 1-indexed
  dateStr: string; // Formatting like "۱۴۰۵/۰۳/۱۰"
  weekdayStr: string; // Day name in Persian (یکشنبه, دوشنبه, ...)
  game1Result: GameResult;
  game2Result: GameResult;
  game3Result: GameResult; // For tie-breakers in playoffs
  status: 'scheduled' | 'completed';
  winnerId: string | null;
  p1Points: number;
  p2Points: number;
  isPlayoff: boolean;
  playoffStage?: PlayoffStage;
  playoffType?: 'final' | 'third_place';
  matchType?: MatchType;
}

export interface TournamentState {
  players: Player[];
  matches: Match[];
  isStarted: boolean;
  playoffStarted: boolean;
  playoffMatches: {
    semiFinal1: Match | null;
    semiFinal2: Match | null;
    final: Match | null;
    thirdPlace: Match | null;
  };
}
