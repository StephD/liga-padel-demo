<template>
  <AppShell>
    <div v-if="match" class="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
      <section class="space-y-5">
        <div class="panel p-6">
          <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Match details</p>
          <h1 class="mt-2 font-display text-4xl font-bold">{{ match.level }}</h1>
          <p class="mt-2 text-lg text-slate-700">{{ formatMatchDate(match.date) }} · {{ formatMatchTime(match.start_time, match.end_time) }}</p>
          <div class="mt-5 flex flex-wrap gap-3">
            <span class="pill bg-court-100 text-court-800">{{ getDerivedMatchStatus(match) }}</span>
            <span class="pill bg-slate-100 text-slate-700">{{ match.approvedPlayers.length }}/4 approved</span>
            <span v-if="pendingMatchIds.includes(match.id)" class="pill bg-clay/10 text-clay">Your request is pending</span>
          </div>
          <div class="mt-6">
            <PlayerSlots :approved-players="match.approvedPlayers" :current-player-name="trimmedName" />
          </div>
          <div class="mt-6 flex flex-wrap gap-3">
            <button class="btn-primary" :disabled="getDerivedMatchStatus(match) !== 'open'" @click="showModal = true">Join</button>
            <ShareButton :text="shareText" />
          </div>
        </div>
      </section>

      <aside class="space-y-5">
        <div class="panel p-5">
          <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Saved player name</p>
          <input v-model="playerName" class="field mt-3" maxlength="40" placeholder="Your name" />
          <p class="mt-3 text-sm text-slate-600">
            This helps us prefill the join form and highlight your approved slot on the card.
          </p>
        </div>

        <div class="panel p-5 text-sm leading-6 text-slate-600">
          The waiting list stays private. Players only see confirmed slots and whether their own request was submitted from this device.
        </div>
      </aside>
    </div>

    <div v-else class="panel p-6 text-sm text-slate-600">Loading match...</div>

    <JoinModal
      v-if="showModal && match"
      v-model="joinName"
      :title="match.level"
      :submitting="joining"
      :error="joinError"
      @close="showModal = false"
      @submit="submitJoin"
    />
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '../layouts/AppShell.vue'
import JoinModal from '../components/public/JoinModal.vue'
import PlayerSlots from '../components/public/PlayerSlots.vue'
import ShareButton from '../components/public/ShareButton.vue'
import { createPendingRegistration, fetchMatchById } from '../lib/api'
import { usePlayerName } from '../composables/usePlayerName'
import { formatMatchDate, formatMatchTime, getDerivedMatchStatus, shareTextForMatch } from '../lib/utils'
import type { MatchWithPlayers } from '../lib/types'

const route = useRoute()
const { playerName, trimmedName, pendingMatchIds, setPlayerName, markPending } = usePlayerName()

const match = ref<MatchWithPlayers | null>(null)
const showModal = ref(false)
const joinName = ref('')
const joining = ref(false)
const joinError = ref('')

const shareText = computed(() =>
  match.value ? shareTextForMatch(match.value, `${window.location.origin}/match/${match.value.id}`) : ''
)

async function loadMatch() {
  match.value = await fetchMatchById(String(route.params.id))
}

async function submitJoin(value: string) {
  if (!match.value) return

  joining.value = true
  joinError.value = ''

  try {
    await createPendingRegistration(match.value.id, value)
    setPlayerName(value.trim())
    markPending(match.value.id)
    showModal.value = false
  } catch (error) {
    joinError.value = error instanceof Error ? error.message : 'Unable to join this match.'
  } finally {
    joining.value = false
  }
}

onMounted(async () => {
  await loadMatch()
  joinName.value = trimmedName.value
})
</script>
