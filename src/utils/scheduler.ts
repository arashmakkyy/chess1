/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Match, GameResult } from '../types';

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
export function generateMatchDates(startSunday: Date, totalMatches: number): Array<{ date: Date; weekdayStr: string; dateStr: string }> {
  const schedule: Array<{ date: Date; weekdayStr: string; dateStr: string }> = [];
  let currentDate = new Date(startSunday);
  let matchesCount = 0;

  while (matchesCount < totalMatches) {
    const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 5 for Friday, 6 for Saturday
    
    if (dayOfWeek === 5) {
      // It's Friday! Skip scheduling a match on Friday.
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
 * Creates 12 matches for a double round-robin between 4 players.
 * Then shuffles them randomly so they are in an exciting order,
 * ensuring no player plays multiple matches on the same day (not possible anyway since we play 1 match/day).
 * Then schedules them on consecutive days starting Sunday, skipping Friday.
 */
export function createRoundRobinSchedule(players: Player[], startSunday: Date): Match[] {
  if (players.length < 4) return [];

  // Generate all 12 pairing combinations (double round-robin)
  // Pairings:
  // Leg 1 (6 matches)
  const leg1Pairings: Array<[string, string]> = [
    [players[0].id, players[1].id],
    [players[2].id, players[3].id],
    [players[0].id, players[2].id],
    [players[1].id, players[3].id],
    [players[0].id, players[3].id],
    [players[1].id, players[2].id]
  ];

  // Leg 2 with reversed colors / home-away (6 matches)
  const leg2Pairings: Array<[string, string]> = [
    [players[1].id, players[0].id],
    [players[3].id, players[2].id],
    [players[2].id, players[0].id],
    [players[3].id, players[1].id],
    [players[3].id, players[0].id],
    [players[2].id, players[1].id]
  ];

  // Combine and shuffle
  const allPairings = [...leg1Pairings, ...leg2Pairings];
  
  // Shuffle algorithm
  for (let i = allPairings.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPairings[i], allPairings[j]] = [allPairings[j], allPairings[i]];
  }

  // Create match dates
  const matchDates = generateMatchDates(startSunday, allPairings.length);

  // Map pairings to Matches
  return allPairings.map((pairing, index) => {
    const dateInfo = matchDates[index];
    const isWent = leg1Pairings.some(leg => leg[0] === pairing[0] && leg[1] === pairing[1]);
    const matchType = isWent ? 'went' : 'returned';
    return {
      id: `match_${index + 1}`,
      player1Id: pairing[0],
      player2Id: pairing[1],
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
      matchType
    };
  });
}
