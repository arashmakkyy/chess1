import { get, put } from '@vercel/blob';

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
  { id: 'p10', name: 'آروین توکلی', group: 'B', matchesPlayed: 0, matchesWon: 0, matchesLost: 0, gamesWon: 0, gamesLost: 0, gamesDrew: 0, points: 0, avatarSeed: 'tavakoli' }
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
let memoryStore: TournamentStateData = DEFAULT_TOURNAMENT_STATE;

export async function loadTournamentState(): Promise<TournamentStateData> {
  try {
    const result = await get(STATE_PATH, { access: 'private' });
    if (result?.statusCode === 200) {
      const parsed = JSON.parse(await new Response(result.stream).text());
      if (parsed?.players?.length === 10) {
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
      }
    }
  } catch (error) {
    console.warn('Could not read tournament state from Blob:', error);
  }
  return memoryStore;
}

export async function saveTournamentState(newState: TournamentStateData): Promise<TournamentStateData> {
  const updatedState = { ...newState, lastUpdated: new Date().toISOString() };
  memoryStore = updatedState;
  await put(STATE_PATH, JSON.stringify(updatedState), {
    access: 'private',
    addRandomSuffix: false,
    contentType: 'application/json',
    allowOverwrite: true
  });
  return updatedState;
}

export async function resetTournamentState(): Promise<TournamentStateData> {
  return saveTournamentState({ ...DEFAULT_TOURNAMENT_STATE, lastUpdated: new Date().toISOString() });
}

export function getDefaultTournamentState(): TournamentStateData {
  return DEFAULT_TOURNAMENT_STATE;
}
