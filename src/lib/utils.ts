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

export function getLevelBadgeClass(level: string) {
  const normalizedLevel = level.trim().toLowerCase()

  if (normalizedLevel.includes('beginner')) {
    return 'border border-slate-200 bg-white text-slate-600'
  }

  if (normalizedLevel.includes('bronze')) {
    if (normalizedLevel.includes('low')) return 'bg-orange-100 text-orange-800'
    if (normalizedLevel.includes('high')) return 'bg-orange-800 text-orange-50'
    return 'bg-orange-300 text-orange-900'
  }

  if (normalizedLevel.includes('silver')) {
    if (normalizedLevel.includes('low')) return 'bg-zinc-50 text-zinc-600'
    if (normalizedLevel.includes('high')) return 'bg-zinc-400 text-zinc-900'
    return 'bg-zinc-200 text-zinc-700'
  }

  if (normalizedLevel.includes('gold')) {
    if (normalizedLevel.includes('low')) return 'bg-yellow-100 text-yellow-800'
    if (normalizedLevel.includes('high')) return 'bg-yellow-500 text-yellow-950'
    return 'bg-yellow-300 text-yellow-900'
  }

  return 'bg-court-600 text-white'
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
