<template>
  <div class="min-h-screen">
    <header class="px-4 pb-4 pt-5 sm:px-6">
      <div class="mx-auto flex max-w-6xl items-center justify-between">
        <RouterLink to="/week/current" class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-court-600 text-sm font-bold text-white">
            LP
          </div>
          <div>
            <p class="font-display text-lg font-bold">Liga Padel</p>
            <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Match board</p>
          </div>
        </RouterLink>
        <nav class="flex items-center gap-2">
          <RouterLink class="btn-secondary px-3 py-2 text-xs" to="/week/current">Schedule</RouterLink>
          <RouterLink class="btn-secondary px-3 py-2 text-xs" to="/admin">Admin</RouterLink>
        </nav>
      </div>
    </header>

    <main class="px-4 pb-12 sm:px-6">
      <div class="mx-auto max-w-6xl">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>
