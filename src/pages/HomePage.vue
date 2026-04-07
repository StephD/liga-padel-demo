<template>
  <AppShell>
    <section class="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
      <div class="space-y-4">
        <div class="panel overflow-hidden p-4 sm:p-5">
          <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Weekly board</p>
          <h1 class="mt-2 font-display text-2xl font-bold leading-tight text-ink sm:text-4xl">
            Weekly padel schedule
          </h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Browse upcoming matches and join the waiting list in a couple of taps.
          </p>
        </div>

        <div class="panel p-4">
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-semibold">Weeks</p>
              <p class="text-xs text-slate-500">Monday to Sunday schedule view</p>
            </div>
          </div>
          <WeekTabs :weeks="weekTabs" :active-week-id="activeWeekId" />
        </div>

        <div class="panel p-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-semibold">Filter by level</p>
              <p class="text-xs text-slate-500">Only show the levels you want to play</p>
            </div>
            <select v-model="selectedLevel" class="field w-full sm:max-w-xs">
              <option value="">All levels</option>
              <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
            </select>
          </div>
        </div>

        <div class="space-y-3">
          <MatchCard
            v-for="match in visibleMatches"
            :key="match.id"
            :match="match"
            :current-player-name="trimmedName"
            :is-pending="pendingMatchIds.includes(match.id)"
            @join="openJoinModal(match)"
          />

          <div v-if="!loading && visibleMatches.length === 0" class="panel p-6 text-sm text-slate-600">
            No matches found for this week and filter.
          </div>
        </div>
      </div>

      <aside class="space-y-4">
        <div class="panel p-4 sm:p-5">
          <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Player name</p>
          <h2 class="mt-2 font-display text-2xl font-bold">Stay recognized on this device</h2>
          <input
            v-model="playerName"
            class="field mt-4"
            placeholder="Type your name once"
            maxlength="40"
          />
          <p class="mt-3 text-sm leading-6 text-slate-600">
            Your saved name is prefilled when you join future matches and helps highlight your pending requests.
          </p>
        </div>

        <div class="panel hidden p-4 sm:block sm:p-5">
          <p class="text-xs uppercase tracking-[0.22em] text-slate-500">How it works</p>
          <ol class="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>Pick a match and tap Join.</li>
            <li>Your request goes to a private waiting list.</li>
            <li>An admin approves players into the first open slot.</li>
          </ol>
        </div>
      </aside>
    </section>

    <JoinModal
      v-if="selectedMatch"
      v-model="joinName"
      :title="selectedMatch.level"
      :submitting="joining"
      :error="joinError"
      @close="selectedMatch = null"
      @submit="submitJoin"
    />
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addWeeks, format, startOfWeek } from 'date-fns'
import AppShell from '../layouts/AppShell.vue'
import MatchCard from '../components/public/MatchCard.vue'
import WeekTabs from '../components/public/WeekTabs.vue'
import JoinModal from '../components/public/JoinModal.vue'
import { buildWeekBuckets, createPendingRegistration, fetchPublicMatches } from '../lib/api'
import { usePlayerName } from '../composables/usePlayerName'
import { getWeekId } from '../lib/utils'
import type { MatchWithPlayers } from '../lib/types'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const joining = ref(false)
const joinError = ref('')
const allMatches = ref<MatchWithPlayers[]>([])
const selectedMatch = ref<MatchWithPlayers | null>(null)
const selectedLevel = ref('')
const joinName = ref('')

const { playerName, trimmedName, pendingMatchIds, setPlayerName, markPending } = usePlayerName()

const weekBuckets = computed(() => buildWeekBuckets(allMatches.value))
const today = new Date()
const fallbackWeekId = computed(() => format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'))
const nextWeekId = computed(() => format(addWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1), 'yyyy-MM-dd'))
const allowedWeekIds = computed(() => [fallbackWeekId.value, nextWeekId.value])
const publicWeekBuckets = computed(() =>
  allowedWeekIds.value
    .map((weekId) => weekBuckets.value.find((week) => week.weekId === weekId))
    .filter((week): week is NonNullable<typeof weekBuckets.value[number]> => Boolean(week))
)
const weekTabs = computed(() =>
  publicWeekBuckets.value.map(({ weekId, label, endLabel }) => ({
    weekId,
    label,
    endLabel,
    isCurrent: weekId === fallbackWeekId.value
  }))
)

const activeWeekId = computed(() => {
  if (route.params.weekId && route.params.weekId !== 'current') {
    const requestedWeekId = String(route.params.weekId)
    if (allowedWeekIds.value.includes(requestedWeekId)) {
      return requestedWeekId
    }
  }

  return publicWeekBuckets.value.find((week) => week.weekId === fallbackWeekId.value)?.weekId ?? publicWeekBuckets.value[0]?.weekId ?? fallbackWeekId.value
})

const levels = computed(() =>
  Array.from(new Set(allMatches.value.map((match) => match.level))).sort((left, right) => left.localeCompare(right))
)

const visibleMatches = computed(() => {
  const currentWeek = weekBuckets.value.find((week) => week.weekId === activeWeekId.value)
  const matches = currentWeek?.matches ?? []

  return selectedLevel.value ? matches.filter((match) => match.level === selectedLevel.value) : matches
})

async function loadMatches() {
  loading.value = true

  try {
    allMatches.value = await fetchPublicMatches()

    if (route.path === '/week/current' && publicWeekBuckets.value.length > 0) {
      const currentWeek =
        publicWeekBuckets.value.find((week) => week.weekId === fallbackWeekId.value) ?? publicWeekBuckets.value[0]
      router.replace(`/week/${currentWeek.weekId}`)
      return
    }

    if (
      route.params.weekId &&
      route.params.weekId !== 'current' &&
      !allowedWeekIds.value.includes(String(route.params.weekId))
    ) {
      router.replace(`/week/${fallbackWeekId.value}`)
    }
  } finally {
    loading.value = false
  }
}

function openJoinModal(match: MatchWithPlayers) {
  selectedMatch.value = match
  joinName.value = trimmedName.value
  joinError.value = ''
}

async function submitJoin(value: string) {
  if (!selectedMatch.value) return

  joining.value = true
  joinError.value = ''

  try {
    await createPendingRegistration(selectedMatch.value.id, value)
    setPlayerName(value.trim())
    markPending(selectedMatch.value.id)
    selectedMatch.value = null
  } catch (error) {
    joinError.value = error instanceof Error ? error.message : 'Unable to join this match.'
  } finally {
    joining.value = false
  }
}

onMounted(loadMatches)
</script>
