import { TournamentState, Match } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function fetchLeagueFromServer(): Promise<TournamentState | null> {
  try {
    const response = await fetch('/api/league', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    const json: ApiResponse<TournamentState> = await response.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (error) {
    console.warn('Could not fetch league state from backend, using local state:', error);
    return null;
  }
}

export async function saveLeagueToServer(state: TournamentState): Promise<boolean> {
  try {
    const response = await fetch('/api/league', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(state)
    });
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    const json = await response.json();
    return json.success === true;
  } catch (error) {
    console.warn('Could not save league state to backend:', error);
    return false;
  }
}

export async function resetLeagueOnServer(): Promise<TournamentState | null> {
  try {
    const response = await fetch('/api/league/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    const json: ApiResponse<TournamentState> = await response.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (error) {
    console.warn('Could not reset league on backend:', error);
    return null;
  }
}
