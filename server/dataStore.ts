import dotenv from 'dotenv';
import { del, list, put } from '@vercel/blob';

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

// Vercel Blob's public store serves every object through a CDN with a
// minimum edge cache lifetime of 1 minute (cacheControlMaxAge cannot go
// lower). Overwriting the *same* pathname (`allowOverwrite: true`) means the
// CDN keeps serving the previously cached bytes for that URL — cache-busting
// query params and `cache: 'no-store'` only affect the local fetch, not the
// remote edge cache, so reads can silently return stale data right after a
// save. This is the root cause of "stuck offline / not real-time".
//
// The fix: never re-read through a cached URL. Every save writes to a brand
// new, never-before-requested pathname (timestamped), so there is no cached
// entry to collide with. Reads always ask the Blob *listing* API (which is
// metadata, not CDN-cached content) for the most recent entry, then fetch
// that entry's unique URL for the first and only time.
const STATE_PREFIX = 'chess-league/state/';
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
  let latestPathname: string | null = null;
  try {
    const { blobs } = await list({ prefix: STATE_PREFIX });
    if (blobs.length === 0) {
      // A fresh Blob store has no state object yet. Initialize it once so
      // the API becomes usable, while still failing loudly for other errors.
      return saveTournamentState(DEFAULT_TOURNAMENT_STATE);
    }
    const latest = blobs.reduce((a, b) => (a.uploadedAt > b.uploadedAt ? a : b));
    latestPathname = latest.pathname;

    const response = await fetch(latest.url, { cache: 'no-store' });
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
    throw new Error(
      `Could not read tournament state from Blob${latestPathname ? ` (${latestPathname})` : ''}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function saveTournamentState(newState: TournamentStateData): Promise<TournamentStateData> {
  const updatedState = { ...newState, lastUpdated: new Date().toISOString() };
  const payload = JSON.stringify(updatedState);
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await put(`${BACKUP_PREFIX}${updatedState.lastUpdated}.json`, payload, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    allowOverwrite: false
  });
  // Write the "current" state to a brand-new pathname every time, so this
  // exact URL has never been requested and cannot be served from cache.
  const current = await put(`${STATE_PREFIX}${uniqueSuffix}.json`, payload, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    allowOverwrite: false
  });

  // Best-effort cleanup of older "current" pointers so the prefix doesn't
  // grow unbounded. Failure here must never block the save from succeeding.
  try {
    const { blobs } = await list({ prefix: STATE_PREFIX });
    const stale = blobs.filter((b) => b.url !== current.url);
    if (stale.length > 0) {
      await del(stale.map((b) => b.url));
    }
  } catch {
    // Ignore cleanup failures; they don't affect correctness of the next read.
  }

  memoryStore = updatedState;
  return updatedState;
}

export async function resetTournamentState(): Promise<TournamentStateData> {
  return saveTournamentState({ ...DEFAULT_TOURNAMENT_STATE, lastUpdated: new Date().toISOString() });
}

export function getDefaultTournamentState(): TournamentStateData {
  return DEFAULT_TOURNAMENT_STATE;
}
