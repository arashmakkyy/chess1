/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Match, GroupIdentifier } from '../types';

/**
 * Formats a Gregorian date to Persian date string using built-in Intl API.
 */
export function formatPersianDate(date: Date): { text: string; weekday: string } {
  const formatter = new Intl.DateTimeFormat('fa-IR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const weekdayFormatter = new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long'
  });

  return {
    text: formatter.format(date),
    weekday: weekdayFormatter.format(date)
  };
}

/**
 * Finds the upcoming Sunday starting from a given date.
 * If the given date is already Sunday, returns that date.
 */
export function getNextSunday(startDate: Date): Date {
  const result = new Date(startDate);
  const day = result.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  if (day !== 0) {
    result.setDate(result.getDate() + (7 - day));
  }
  return result;
}

/**
 * Generates match calendar days skipping Friday.
 */
export function generateMatchDates(
  startSunday: Date,
  totalMatches: number
): Array<{ date: Date; weekdayStr: string; dateStr: string }> {
  const schedule: Array<{ date: Date; weekdayStr: string; dateStr: string }> = [];
  const currentDate = new Date(startSunday);
  let matchesCount = 0;

  while (matchesCount < totalMatches) {
    const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 5 for Friday, 6 for Saturday

    if (dayOfWeek === 5) {
      // Skip Friday (League Rest Day)
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    const { text, weekday } = formatPersianDate(currentDate);
    schedule.push({
      date: new Date(currentDate),
      weekdayStr: weekday,
      dateStr: text
    });

    matchesCount++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedule;
}

/**
 * Generates round-robin pairings for a list of players in a single group (1 leg, single round-robin).
 * For 5 players: 5 * 4 / 2 = 10 matches.
 */
function generateGroupPairings(players: Player[]): Array<[string, string]> {
  const pairings: Array<[string, string]> = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      // Alternate white/black pieces based on indices for fairness
      if ((i + j) % 2 === 0) {
        pairings.push([players[i].id, players[j].id]);
      } else {
        pairings.push([players[j].id, players[i].id]);
      }
    }
  }

  // Shuffle group pairings
  for (let i = pairings.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairings[i], pairings[j]] = [pairings[j], pairings[i]];
  }

  return pairings;
}

/**
 * Creates single round-robin schedule for 2 groups (Group A and Group B).
 * Interleaves matches between Group A and Group B to ensure balanced daily excitement.
 */
export function createTwoGroupSingleRoundRobinSchedule(
  players: Player[],
  startSunday: Date
): Match[] {
  const groupAPlayers = players.filter((p) => p.group === 'A');
  const groupBPlayers = players.filter((p) => p.group === 'B');

  const groupAPairings = generateGroupPairings(groupAPlayers);
  const groupBPairings = generateGroupPairings(groupBPlayers);

  // Interleave Group A and Group B matches: A, B, A, B, ...
  const interleavedMatches: Array<{ p1: string; p2: string; group: GroupIdentifier }> = [];
  const maxLen = Math.max(groupAPairings.length, groupBPairings.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < groupAPairings.length) {
      interleavedMatches.push({
        p1: groupAPairings[i][0],
        p2: groupAPairings[i][1],
        group: 'A'
      });
    }
    if (i < groupBPairings.length) {
      interleavedMatches.push({
        p1: groupBPairings[i][0],
        p2: groupBPairings[i][1],
        group: 'B'
      });
    }
  }

  // Generate calendar dates for all 20 group matches
  const matchDates = generateMatchDates(startSunday, interleavedMatches.length);

  return interleavedMatches.map((item, index) => {
    const dateInfo = matchDates[index];
    return {
      id: `match_${item.group}_${index + 1}`,
      player1Id: item.p1,
      player2Id: item.p2,
      group: item.group,
      dayNumber: index + 1,
      dateStr: dateInfo.dateStr,
      weekdayStr: dateInfo.weekdayStr,
      game1Result: 'PENDING',
      game2Result: 'PENDING',
      game3Result: 'PENDING',
      status: 'scheduled',
      winnerId: null,
      p1Points: 0,
      p2Points: 0,
      isPlayoff: false,
      matchType: 'group'
    };
  });
}
