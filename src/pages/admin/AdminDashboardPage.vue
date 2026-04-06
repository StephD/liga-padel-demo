<template>
  <AppShell>
    <section class="space-y-5">
      <div class="panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Admin dashboard</p>
          <h1 class="mt-2 font-display text-3xl font-bold">Matches, approvals, and recurring schedules</h1>
        </div>
        <div class="flex gap-3">
          <button class="btn-secondary" @click="refresh">Refresh</button>
          <button class="btn-secondary" @click="logout">Sign out</button>
        </div>
      </div>

      <div class="grid gap-5 xl:grid-cols-[0.9fr,1.1fr]">
        <div class="space-y-5">
          <section class="panel p-5">
            <div class="mb-4">
              <p class="text-sm font-semibold">Create or edit match</p>
              <p class="text-xs text-slate-500">Single match management</p>
            </div>
            <AdminMatchForm
              :initial-values="editingMatch ?? undefined"
              :submitting="saving"
              :show-cancel="Boolean(editingMatch)"
              @submit="saveMatch"
              @cancel="editingMatch = null"
            />
          </section>

          <section class="panel p-5">
            <div class="mb-4">
              <p class="text-sm font-semibold">Recurring match generator</p>
              <p class="text-xs text-slate-500">Create weekly repeats in one action</p>
            </div>
            <RecurringMatchForm :submitting="creatingRecurring" @submit="generateRecurring" />
          </section>
        </div>

        <section class="space-y-4">
          <article v-for="match in matches" :key="match.id" class="panel p-5">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500">{{ formatMatchDate(match.date) }}</p>
                <h2 class="mt-2 font-display text-2xl font-bold">{{ match.level }}</h2>
                <p class="mt-1 text-sm text-slate-600">{{ formatMatchTime(match.start_time, match.end_time) }}</p>
                <p class="mt-3 text-sm text-slate-700">
                  {{ match.approvedPlayers.length }}/4 approved · {{ pendingRegistrationsForMatch(match.registrations ?? []).length }} pending
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button class="btn-secondary px-3 py-2 text-xs" @click="editingMatch = match">Edit</button>
                <button class="btn-secondary px-3 py-2 text-xs" @click="promptDirectAdd(match.id)">Add player</button>
                <button class="btn-secondary px-3 py-2 text-xs text-rose-700" @click="removeMatch(match.id)">Delete</button>
              </div>
            </div>

            <div class="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <p class="mb-3 text-sm font-semibold">Confirmed players</p>
                <div class="space-y-2">
                  <div
                    v-for="slot in 4"
                    :key="slot"
                    class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  >
                    {{ match.approvedPlayers[slot - 1]?.player_name ?? 'Open slot' }}
                  </div>
                </div>
              </div>

              <div>
                <p class="mb-3 text-sm font-semibold">Waiting list</p>
                <div class="space-y-2">
                  <div
                    v-for="registration in pendingRegistrationsForMatch(match.registrations ?? [])"
                    :key="registration.id"
                    class="rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <p class="font-medium">{{ registration.player_name }}</p>
                        <p class="text-xs text-slate-500">{{ new Date(registration.created_at).toLocaleString() }}</p>
                      </div>
                      <div class="flex gap-2">
                        <button class="btn-primary px-3 py-2 text-xs" @click="approve(registration.id)">Approve</button>
                        <button class="btn-secondary px-3 py-2 text-xs" @click="refuse(registration.id)">Refuse</button>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="pendingRegistrationsForMatch(match.registrations ?? []).length === 0"
                    class="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500"
                  >
                    No pending registrations.
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppShell from '../../layouts/AppShell.vue'
import AdminMatchForm from '../../components/admin/AdminMatchForm.vue'
import RecurringMatchForm from '../../components/admin/RecurringMatchForm.vue'
import {
  addDirectPlayer,
  approveRegistration,
  createRecurringMatches,
  deleteMatch,
  fetchAdminMatches,
  pendingRegistrationsForMatch,
  refuseRegistration,
  upsertMatch
} from '../../lib/api'
import { formatMatchDate, formatMatchTime } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import type { MatchFormValues, MatchWithPlayers } from '../../lib/types'

const matches = ref<MatchWithPlayers[]>([])
const editingMatch = ref<MatchWithPlayers | null>(null)
const saving = ref(false)
const creatingRecurring = ref(false)

async function refresh() {
  matches.value = await fetchAdminMatches()
}

async function saveMatch(values: MatchFormValues) {
  saving.value = true

  try {
    await upsertMatch(values, editingMatch.value?.id)
    editingMatch.value = null
    await refresh()
  } finally {
    saving.value = false
  }
}

async function removeMatch(id: string) {
  if (!window.confirm('Delete this match and its registrations?')) return
  await deleteMatch(id)
  await refresh()
}

async function approve(registrationId: string) {
  await approveRegistration(registrationId)
  await refresh()
}

async function refuse(registrationId: string) {
  await refuseRegistration(registrationId)
  await refresh()
}

async function promptDirectAdd(matchId: string) {
  const playerName = window.prompt('Player name')
  if (!playerName) return
  await addDirectPlayer(matchId, playerName)
  await refresh()
}

async function generateRecurring(values: {
  startDate: string
  startTime: string
  endTime: string
  level: string
  status: 'open' | 'full' | 'closed'
  repeatWeeks: number
}) {
  creatingRecurring.value = true

  try {
    await createRecurringMatches(values)
    await refresh()
  } finally {
    creatingRecurring.value = false
  }
}

async function logout() {
  await supabase.auth.signOut()
  window.location.href = '/admin/login'
}

onMounted(refresh)
</script>
