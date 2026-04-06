<template>
  <div class="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
    <RouterLink
      v-for="week in weeks"
      :key="week.weekId"
      :to="`/week/${week.weekId}`"
      class="min-w-[9.5rem] rounded-2xl border px-4 py-3 transition"
      :class="
        activeWeekId === week.weekId
          ? 'border-court-500 bg-court-600 text-white'
          : 'border-white/70 bg-white/80 text-slate-700'
      "
    >
      <p class="text-xs uppercase tracking-[0.18em] opacity-80">Week</p>
      <p class="mt-1 font-display text-base font-bold">{{ week.label }}</p>
      <p class="text-xs opacity-80">{{ week.endLabel }}</p>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  weeks: { weekId: string; label: string; endLabel: string }[]
  activeWeekId: string
}>()
</script>
