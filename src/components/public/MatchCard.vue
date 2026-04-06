<template>
  <article class="panel p-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500">{{ formatMatchDate(match.date) }}</p>
        <h3 class="mt-2 font-display text-xl font-bold">{{ match.level }}</h3>
        <p class="mt-1 text-sm text-slate-600">{{ formatMatchTime(match.start_time, match.end_time) }}</p>
      </div>
      <span class="pill" :class="statusClass">{{ derivedStatus }}</span>
    </div>

    <div class="mt-5">
      <PlayerSlots :approved-players="match.approvedPlayers" :current-player-name="currentPlayerName" />
    </div>

    <div class="mt-5 flex items-center justify-between gap-3">
      <div class="text-sm text-slate-600">
        <p>{{ match.approvedPlayers.length }}/4 players confirmed</p>
        <p v-if="isPending" class="font-semibold text-clay">You are on the waiting list</p>
      </div>
      <div class="flex gap-2">
        <RouterLink :to="`/match/${match.id}`" class="btn-secondary px-3 py-2 text-xs">Details</RouterLink>
        <button class="btn-primary px-4 py-2 text-xs" :disabled="joinDisabled" @click="$emit('join')">
          {{ joinDisabled ? 'Unavailable' : 'Join' }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MatchWithPlayers } from '../../lib/types'
import { formatMatchDate, formatMatchTime, getDerivedMatchStatus } from '../../lib/utils'
import PlayerSlots from './PlayerSlots.vue'

const props = defineProps<{
  match: MatchWithPlayers
  currentPlayerName?: string
  isPending?: boolean
}>()

defineEmits<{
  join: []
}>()

const derivedStatus = computed(() => getDerivedMatchStatus(props.match))
const joinDisabled = computed(() => derivedStatus.value !== 'open')
const statusClass = computed(() => {
  switch (derivedStatus.value) {
    case 'open':
      return 'bg-court-100 text-court-800'
    case 'full':
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-slate-200 text-slate-700'
  }
})
</script>
