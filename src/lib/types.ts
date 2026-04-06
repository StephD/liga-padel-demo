export type MatchStatus = 'open' | 'full' | 'closed'
export type RegistrationStatus = 'pending' | 'approved' | 'refused'

export interface Registration {
  id: string
  match_id: string
  player_name: string
  status: RegistrationStatus
  created_at: string
}

export interface MatchRecord {
  id: string
  date: string
  start_time: string
  end_time: string
  level: string
  status: MatchStatus
  week_label: string
  created_at: string
  registrations?: Registration[]
}

export interface MatchWithPlayers extends MatchRecord {
  approvedPlayers: Registration[]
  pendingCount: number
}

export interface MatchFormValues {
  date: string
  start_time: string
  end_time: string
  level: string
  status: MatchStatus
  week_label: string
}
