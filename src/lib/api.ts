import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import { supabase } from './supabase'
import { getWeekId } from './utils'
import type { MatchFormValues, MatchRecord, MatchWithPlayers, Registration } from './types'

function mapMatch(match: MatchRecord): MatchWithPlayers {
  const registrations = match.registrations ?? []
  return {
    ...match,
    approvedPlayers: registrations.filter((registration) => registration.status === 'approved'),
    pendingCount: registrations.filter((registration) => registration.status === 'pending').length
  }
}

export async function fetchPublicMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(
      `
        *,
        registrations:registrations!registrations_match_id_fkey (
          id,
          match_id,
          player_name,
          status,
          created_at
        )
      `
    )
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error

  return (data as MatchRecord[]).map(mapMatch)
}

export async function fetchMatchById(id: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(
      `
        *,
        registrations:registrations!registrations_match_id_fkey (
          id,
          match_id,
          player_name,
          status,
          created_at
        )
      `
    )
    .eq('id', id)
    .single()

  if (error) throw error

  return mapMatch(data as MatchRecord)
}

export async function fetchAdminMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(
      `
        *,
        registrations (
          id,
          match_id,
          player_name,
          status,
          created_at
        )
      `
    )
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error

  return (data as MatchRecord[]).map(mapMatch)
}

export async function createPendingRegistration(matchId: string, playerName: string) {
  const sanitizedName = playerName.trim()

  const { data: existing, error: existingError } = await supabase
    .from('registrations')
    .select('id')
    .eq('match_id', matchId)
    .ilike('player_name', sanitizedName)
    .limit(1)

  if (existingError) throw existingError

  if (existing.length > 0) {
    throw new Error('This player is already registered for the match.')
  }

  const { error } = await supabase.from('registrations').insert({
    match_id: matchId,
    player_name: sanitizedName,
    status: 'pending'
  })

  if (error) {
    if ('code' in error && error.code === '23505') {
      throw new Error('This player is already registered for the match.')
    }

    throw error
  }
}

export async function upsertMatch(match: MatchFormValues, id?: string) {
  if (id) {
    const { error } = await supabase.from('matches').update(match).eq('id', id)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('matches').insert(match)
  if (error) throw error
}

export async function deleteMatch(id: string) {
  const { error } = await supabase.from('matches').delete().eq('id', id)
  if (error) throw error
}

export async function approveRegistration(registrationId: string) {
  const { error } = await supabase.rpc('approve_registration', {
    registration_id_input: registrationId
  })

  if (error) throw error
}

export async function refuseRegistration(registrationId: string) {
  const { error } = await supabase
    .from('registrations')
    .update({ status: 'refused' })
    .eq('id', registrationId)
    .eq('status', 'pending')

  if (error) throw error
}

export async function addDirectPlayer(matchId: string, playerName: string) {
  const { error } = await supabase.rpc('add_direct_player', {
    match_id_input: matchId,
    player_name_input: playerName.trim()
  })

  if (error) throw error
}

export async function createRecurringMatches(values: {
  startDate: string
  startTime: string
  endTime: string
  level: string
  status: 'open' | 'full' | 'closed'
  repeatWeeks: number
}) {
  const start = parseISO(values.startDate)
  const rows = Array.from({ length: values.repeatWeeks }, (_, index) => {
    const date = addDays(start, index * 7)
    return {
      date: format(date, 'yyyy-MM-dd'),
      start_time: values.startTime,
      end_time: values.endTime,
      level: values.level,
      status: values.status,
      week_label: getWeekId(format(date, 'yyyy-MM-dd'))
    }
  })

  const { error } = await supabase.from('matches').insert(rows)
  if (error) throw error
}

export function buildWeekBuckets(matches: MatchWithPlayers[]) {
  const grouped = new Map<string, MatchWithPlayers[]>()

  for (const match of matches) {
    const weekId = match.week_label || getWeekId(match.date)
    grouped.set(weekId, [...(grouped.get(weekId) ?? []), match])
  }

  return Array.from(grouped.entries())
    .map(([weekId, items]) => ({
      weekId,
      label: format(startOfWeek(parseISO(weekId), { weekStartsOn: 1 }), 'MMM d'),
      endLabel: format(addDays(parseISO(weekId), 6), 'MMM d'),
      matches: items.sort((left, right) =>
        `${left.date}${left.start_time}`.localeCompare(`${right.date}${right.start_time}`)
      )
    }))
    .sort((left, right) => left.weekId.localeCompare(right.weekId))
}

export function pendingRegistrationsForMatch(registrations: Registration[]) {
  return registrations.filter((registration) => registration.status === 'pending')
}
