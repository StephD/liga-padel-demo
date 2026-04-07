<template>
  <div class="grid grid-cols-2 gap-2 sm:flex sm:gap-3 sm:overflow-x-auto sm:pb-1">
    <RouterLink
      v-for="week in weeks"
      :key="week.weekId"
      :to="`/week/${week.weekId}`"
      class="min-w-0 rounded-2xl border px-3 py-3 transition sm:min-w-[9.5rem] sm:px-4"
      :class="
        week.isCurrent
          ? 'border-court-500 bg-court-600 text-white'
          : activeWeekId === week.weekId
            ? 'border-slate-400 bg-slate-50 text-slate-800 shadow-sm'
            : 'border-slate-300 bg-white text-slate-700'
      "
    >
      <p class="text-[10px] uppercase tracking-[0.18em] opacity-80 sm:text-xs">
        {{ week.isCurrent ? 'This week' : 'Next week' }}
      </p>
      <p class="mt-1 font-display text-lg font-bold leading-none sm:text-base">{{ week.label }}</p>
      <p class="mt-1 text-xs opacity-80">{{ week.endLabel }}</p>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  weeks: { weekId: string; label: string; endLabel: string; isCurrent: boolean }[]
  activeWeekId: string
}>()
</script>
