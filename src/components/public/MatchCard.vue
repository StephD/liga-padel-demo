<template>
  <article class="panel overflow-hidden p-3.5 sm:p-5">
    <div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
      <div class="min-w-0">
        <p class="font-display text-xl font-bold leading-none text-ink sm:text-xl">
          {{ formatMatchDate(match.date) }}
        </p>
        <p class="mt-1 text-sm text-slate-600">{{ formatMatchTime(match.start_time, match.end_time) }}</p>
      </div>
      <div class="flex min-w-0 flex-col items-end gap-1.5">
        <span
          class="pill max-w-[7.5rem] truncate px-2.5 py-1 text-[10px] sm:max-w-none sm:text-xs"
          :class="levelClass"
        >
          {{ match.level }}
        </span>
        <span class="pill px-2.5 py-1 text-[10px] sm:text-xs" :class="statusClass">{{ derivedStatus }}</span>
      </div>
    </div>

    <div class="mt-3">
      <PlayerSlots :approved-players="match.approvedPlayers" :current-player-name="currentPlayerName" />
    </div>

    <div class="mt-3">
      <div class="text-xs text-slate-600 sm:text-sm">
        <p>{{ match.approvedPlayers.length }}/4 players confirmed</p>
        <p v-if="isPending" class="mt-1 font-semibold text-clay">You are on the waiting list</p>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <RouterLink :to="`/match/${match.id}`" class="btn-secondary min-w-0 px-3 py-2 text-center text-xs">
          Details
        </RouterLink>
        <button class="btn-primary min-w-0 px-3 py-2 text-xs" :disabled="joinDisabled" @click="$emit('join')">
          {{ joinDisabled ? 'Unavailable' : 'Join' }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MatchWithPlayers } from '../../lib/types'
import {
  formatMatchDate,
  formatMatchTime,
  getDerivedMatchStatus,
  getLevelBadgeClass
} from '../../lib/utils'
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
const levelClass = computed(() => getLevelBadgeClass(props.match.level))
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
