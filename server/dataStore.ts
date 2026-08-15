import fs from 'fs';
import path from 'path';

export interface PlayerData {
  id: string;
  name: string;
  group: 'A' | 'B';
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrew: number;
  points: number;
  avatarSeed: string;
}

export interface MatchData {
  id: string;
  player1Id: string;
  player2Id: string;
  group?: 'A' | 'B';
  dayNumber: number;
  dateStr: string;
  weekdayStr: string;
  game1Result: string;
  game2Result: string;
  game3Result: string;
  status: 'scheduled' | 'completed';
  winnerId: string | null;
  p1Points: number;
  p2Points: number;
  isPlayoff: boolean;
  playoffStage?: string;
  matchType?: string;
}

export interface TournamentStateData {
  players: PlayerData[];
  matches: MatchData[];
  isStarted: boolean;
  playoffStarted: boolean;
  playoffMatches: {
    semiFinal1: MatchData | null;
    semiFinal2: MatchData | null;
    final: MatchData | null;
    thirdPlace: MatchData | null;
  };
  lastUpdated?: string;
}

const DEFAULT_PLAYERS: PlayerData[] = [
  // Group A (5 players)
  { id: 'p1', name: 'آرش مکی', group: 'A', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'arash' },
  { id: 'p2', name: 'علیرضا علی نژاد', group: 'A', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'alireza' },
  { id: 'p3', name: 'محمد ادیبی', group: 'A', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'adibi' },
  { id: 'p4', name: 'مهرداد خوش لفظ', group: 'A', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'mehrdad' },
  { id: 'p5', name: 'علی رشیدی', group: 'A', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'rashidi' },

  // Group B (5 players)
  { id: 'p6', name: 'محمد حیدری', group: 'B', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'heidari' },
  { id: 'p7', name: 'مصطفی خدابین', group: 'B', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'khodabin' },
  { id: 'p8', name: 'عرفان اسمائیلی', group: 'B', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'erfan' },
  { id: 'p9', name: 'مهدی قنبری', group: 'B', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'ghanbari' },
  { id: 'p10', name: 'آروین توکلی', group: 'B', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'tavakoli' }
];

export const DEFAULT_TOURNAMENT_STATE: TournamentStateData = {
  players: DEFAULT_PLAYERS,
  matches: [],
  isStarted: false,
  playoffStarted: false,
  playoffMatches: {
    semiFinal1: null,
    semiFinal2: null,
    final: null,
    thirdPlace: null
  },
  lastUpdated: new Date().toISOString()
};

// In-Memory Cache for ultra fast serverless & server performance
let memoryStore: TournamentStateData = { ...DEFAULT_TOURNAMENT_STATE };

function getStorageFilePath(): string {
  // Check if primary data directory is writable, otherwise use /tmp for serverless environments (Vercel)
  const localDir = path.join(process.cwd(), 'data');
  const localFile = path.join(localDir, 'tournament_state.json');

  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return localFile;
  } catch (err) {
    // Fallback for Vercel / serverless read-only root filesystems
    const tmpDir = '/tmp';
    return path.join(tmpDir, 'tournament_state.json');
  }
}

export function loadTournamentState(): TournamentStateData {
  try {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && Array.isArray(parsed.players) && parsed.players.length === 10) {
        memoryStore = parsed;
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Could not read persistent file, falling back to memory store:', error);
  }
  return memoryStore;
}

export function saveTournamentState(newState: TournamentStateData): TournamentStateData {
  const updatedState: TournamentStateData = {
    ...newState,
    lastUpdated: new Date().toISOString()
  };

  memoryStore = updatedState;

  try {
    const filePath = getStorageFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(updatedState, null, 2), 'utf-8');
  } catch (error) {
    console.warn('Could not write persistent file, kept in memory store:', error);
  }

  return updatedState;
}

export function resetTournamentState(): TournamentStateData {
  const freshState: TournamentStateData = {
    ...DEFAULT_TOURNAMENT_STATE,
    lastUpdated: new Date().toISOString()
  };

  return saveTournamentState(freshState);
}
