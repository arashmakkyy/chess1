import dotenv from 'dotenv';
import { head, put } from '@vercel/blob';

dotenv.config({ path: '.env.development.local' });
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

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
  { id: 'p1', name: 'آرش مکی', group: 'A', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'arash' },
  { id: 'p2', name: 'مهدیار علیپور', group: 'A', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'mahdiar' },
  { id: 'p3', name: 'محمد ادیبی', group: 'A', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'adibi' },
  { id: 'p4', name: 'مهرداد خوش لفظ', group: 'A', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'mehrdad' },
  { id: 'p5', name: 'علی رشیدی', group: 'A', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'rashidi' },
  { id: 'p6', name: 'محمد حیدری', group: 'B', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'heidari' },
  { id: 'p7', name: 'مصطفی خدابین', group: 'B', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'khodabin' },
  { id: 'p8', name: 'عرفان اسمائیلی', group: 'B', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'erfan' },
  { id: 'p9', name: 'مهدی قنبری', group: 'B', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'ghanbari' },
  { id: 'p10', name: 'آروین توکلی', group: 'B', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'tavakoli' },
  { id: 'p11', name: 'یونس جعفری', group: 'B', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'younes' }
];

export const DEFAULT_TOURNAMENT_STATE: TournamentStateData = {
  players: DEFAULT_PLAYERS,
  matches: [],
  isStarted: false,
  playoffStarted: false,
  playoffMatches: { semiFinal1: null, semiFinal2: null, final: null, thirdPlace: null },
  lastUpdated: new Date().toISOString()
};

const STATE_PATH = 'chess-league/tournament-state.json';
const BACKUP_PREFIX = 'chess-league/backups/';
let memoryStore: TournamentStateData | null = null;

function isValidTournamentState(value: unknown): value is TournamentStateData {
  const state = value as TournamentStateData | null;
  return Boolean(
    state &&
      Array.isArray(state.players) &&
      state.players.length === 11 &&
      Array.isArray(state.matches) &&
      state.playoffMatches &&
      typeof state.isStarted === 'boolean' &&
      typeof state.playoffStarted === 'boolean'
  );
}

export async function loadTournamentState(): Promise<TournamentStateData> {
  // Vercel Blob only allows this store to use `access: 'public'`, and public
  // blobs are served through a CDN. The @vercel/blob `get()` helper can only
  // bypass that CDN cache for *private* blobs, so a public read through it can
  // return a stale copy right after a write — the "stuck offline / not real-time"
  // symptom. To guarantee every read reflects the latest write, we resolve the
  // blob's current URL via `head()` (which always hits the Blob metadata API,
  // never the CDN) and then fetch that URL with a unique cache-busting query
  // param and `cache: 'no-store'`, which forces a fresh origin fetch every time.
  let meta;
  try {
    meta = await head(STATE_PATH, { access: 'public' });
  } catch (error: any) {
    if (error?.name === 'BlobNotFoundError' || error?.status === 404) {
      // A fresh Blob store has no state object yet. Initialize it once so the
      // API becomes usable, while still failing loudly for other errors.
      return saveTournamentState(DEFAULT_TOURNAMENT_STATE);
    }
    throw new Error(`Could not read tournament state metadata from Blob: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const cacheBustedUrl = `${meta.url}?t=${Date.now()}`;
    const response = await fetch(cacheBustedUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Blob fetch returned ${response.status}`);
    }
    const parsed = JSON.parse(await response.text());
    if (!isValidTournamentState(parsed)) {
      throw new Error('Tournament state blob has an invalid shape');
    }

    const migrated = {
      ...parsed,
      players: parsed.players.map((player: PlayerData) =>
        player.id === 'p2' || player.name === 'علیرضا علی نژاد'
          ? { ...player, id: 'p2', name: 'مهدیار علیپور', avatarSeed: 'mahdiar' }
          : player
      )
    };
    memoryStore = migrated;
    return migrated;
  } catch (error) {
    throw new Error(`Could not read tournament state from Blob: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function saveTournamentState(newState: TournamentStateData): Promise<TournamentStateData> {
  const updatedState = { ...newState, lastUpdated: new Date().toISOString() };
  const payload = JSON.stringify(updatedState);
  await put(`${BACKUP_PREFIX}${updatedState.lastUpdated}.json`, payload, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    allowOverwrite: false
  });
  await put(STATE_PATH, payload, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    allowOverwrite: true
  });
  memoryStore = updatedState;
  return updatedState;
}

export async function resetTournamentState(): Promise<TournamentStateData> {
  return saveTournamentState({ ...DEFAULT_TOURNAMENT_STATE, lastUpdated: new Date().toISOString() });
}

export function getDefaultTournamentState(): TournamentStateData {
  return DEFAULT_TOURNAMENT_STATE;
}
