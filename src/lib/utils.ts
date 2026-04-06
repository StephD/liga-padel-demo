import { format, isPast, parseISO, startOfWeek } from 'date-fns'
import type { MatchRecord, MatchWithPlayers } from './types'

export function combineMatchDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`)
}

export function getDerivedMatchStatus(match: MatchWithPlayers | MatchRecord, approvedCount?: number) {
  const filled = approvedCount ?? ('approvedPlayers' in match ? match.approvedPlayers.length : 0)
  const matchStart = combineMatchDateTime(match.date, match.start_time)

  if (match.status === 'closed' || isPast(matchStart)) {
    return 'closed'
  }

  if (filled >= 4) {
    return 'full'
  }

  return 'open'
}

export function formatMatchDate(date: string) {
  return format(parseISO(date), 'EEE, d MMM')
}

export function formatMatchTime(startTime: string, endTime: string) {
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`
}

export function getWeekId(date: string) {
  return format(startOfWeek(parseISO(date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export function shareTextForMatch(match: MatchWithPlayers | MatchRecord, url: string) {
  return [
    'Padel match',
    `${formatMatchDate(match.date)} · ${formatMatchTime(match.start_time, match.end_time)}`,
    `Level: ${match.level}`,
    `Status: ${getDerivedMatchStatus(match, 'approvedPlayers' in match ? match.approvedPlayers.length : undefined)}`,
    url
  ].join('\n')
}
