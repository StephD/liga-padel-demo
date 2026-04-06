<template>
  <div class="grid grid-cols-2 gap-2">
    <div
      v-for="slot in 4"
      :key="slot"
      class="rounded-2xl border px-3 py-3 text-sm"
      :class="
        approvedPlayers[slot - 1]
          ? approvedPlayers[slot - 1].player_name === currentPlayerName
            ? 'border-court-300 bg-court-50 text-court-800'
            : 'border-slate-200 bg-slate-50 text-slate-700'
          : 'border-dashed border-slate-200 bg-white text-slate-400'
      "
    >
      <p class="text-[11px] uppercase tracking-[0.18em]">
        {{ approvedPlayers[slot - 1] ? 'Player' : 'Open slot' }}
      </p>
      <p class="mt-1 truncate font-medium">
        {{ approvedPlayers[slot - 1]?.player_name ?? 'Waiting for approval' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Registration } from '../../lib/types'

defineProps<{
  approvedPlayers: Registration[]
  currentPlayerName?: string
}>()
</script>
