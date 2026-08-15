import { useState, useEffect, useCallback, useRef } from 'react';
import { TournamentState, Player } from '../types';
import {
  fetchLeagueFromServer,
  saveLeagueToServer,
  resetLeagueOnServer
} from '../services/leagueApi';
import { SyncStatus } from '../components/common/SyncStatusBadge';

const STORAGE_KEY = 'CHESS_LEAGUE_10_PLAYERS_V1';

export const INITIAL_PLAYERS: Player[] = [
  // Group A (5 players)
  {
    id: 'p1',
    name: 'آرش مکی',
    group: 'A',
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrew: 0,
    points: 0,
    avatarSeed: 'arash'
  },
  {
    id: 'p2',
    name: 'علیرضا علی نژاد',
    group: 'A',
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrew: 0,
    points: 0,
    avatarSeed: 'alireza'
  },
  {
    id: 'p3',
    name: 'محمد ادیبی',
    group: 'A',
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrew: 0,
    points: 0,
    avatarSeed: 'adibi'
  },
  {
    id: 'p4',
    name: 'مهرداد خوش لفظ',
    group: 'A',
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrew: 0,
    points: 0,
    avatarSeed: 'mehrdad'
  },
  {
    id: 'p5',
    name: 'علی رشیدی',
    group: 'A',
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrew: 0,
    points: 0,
    avatarSeed: 'rashidi'
  },

  // Group B (5 players)
  {
    id: 'p6',
    name: 'محمد حیدری',
    group: 'B',
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrew: 0,
    points: 0,
    avatarSeed: 'heidari'
  },
  {
    id: 'p7',
    name: 'مصطفی خدابین',
    group: 'B',
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrew: 0,
    points: 0,
    avatarSeed: 'khodabin'
  },
  {
    id: 'p8',
    name: 'عرفان اسمائیلی',
    group: 'B',
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrew: 0,
    points: 0,
    avatarSeed: 'erfan'
  },
  {
    id: 'p9',
    name: 'مهدی قنبری',
    group: 'B',
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrew: 0,
    points: 0,
    avatarSeed: 'ghanbari'
  },
  {
    id: 'p10',
    name: 'آروین توکلی',
    group: 'B',
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrew: 0,
    points: 0,
    avatarSeed: 'tavakoli'
  }
];

export const DEFAULT_INITIAL_STATE: TournamentState = {
  players: INITIAL_PLAYERS,
  matches: [],
  isStarted: false,
  playoffStarted: false,
  playoffMatches: {
    semiFinal1: null,
    semiFinal2: null,
    final: null,
    thirdPlace: null
  }
};

export function useTournamentSync() {
  const [state, setState] = useState<TournamentState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.players && parsed.players.length === 10) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing stored tournament state:', e);
      }
    }
    return DEFAULT_INITIAL_STATE;
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const isInitialLoad = useRef(true);

  // Initial fetch from backend
  const loadStateFromServer = useCallback(async () => {
    setSyncStatus('syncing');
    const serverData = await fetchLeagueFromServer();
    if (serverData && serverData.players && serverData.players.length === 10) {
      setState(serverData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
      setSyncStatus('synced');
      setLastSyncTime(new Date());
    } else {
      // If server has no data or fallback, sync our local state to server
      const currentSaved = localStorage.getItem(STORAGE_KEY);
      const stateToSync = currentSaved ? JSON.parse(currentSaved) : DEFAULT_INITIAL_STATE;
      await saveLeagueToServer(stateToSync);
      setSyncStatus('synced');
      setLastSyncTime(new Date());
    }
  }, []);

  useEffect(() => {
    loadStateFromServer();
  }, [loadStateFromServer]);

  // Update state helper that persists locally AND syncs to backend
  const updateTournamentState = useCallback(
    async (updater: TournamentState | ((prev: TournamentState) => TournamentState)) => {
      setState((prev) => {
        const nextState = typeof updater === 'function' ? updater(prev) : updater;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));

        // Background sync to backend
        setSyncStatus('syncing');
        saveLeagueToServer(nextState)
          .then((success) => {
            if (success) {
              setSyncStatus('synced');
              setLastSyncTime(new Date());
            } else {
              setSyncStatus('offline');
            }
          })
          .catch(() => setSyncStatus('offline'));

        return nextState;
      });
    },
    []
  );

  // Reset helper
  const resetEntireTournament = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_INITIAL_STATE);
    setSyncStatus('syncing');
    const resetResult = await resetLeagueOnServer();
    if (resetResult) {
      setState(resetResult);
      setSyncStatus('synced');
      setLastSyncTime(new Date());
    } else {
      setSyncStatus('offline');
    }
  }, []);

  return {
    state,
    setState: updateTournamentState,
    syncStatus,
    lastSyncTime,
    refreshFromServer: loadStateFromServer,
    resetTournament: resetEntireTournament
  };
}
