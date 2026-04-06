import { computed, ref, watch } from 'vue'

const PLAYER_NAME_KEY = 'liga-padel-player-name'
const PLAYER_PENDING_KEY = 'liga-padel-pending'

const playerName = ref(localStorage.getItem(PLAYER_NAME_KEY) ?? '')
const pendingMatchIds = ref<string[]>(JSON.parse(localStorage.getItem(PLAYER_PENDING_KEY) ?? '[]'))

watch(playerName, (value) => {
  localStorage.setItem(PLAYER_NAME_KEY, value)
})

watch(
  pendingMatchIds,
  (value) => {
    localStorage.setItem(PLAYER_PENDING_KEY, JSON.stringify(value))
  },
  { deep: true }
)

export function usePlayerName() {
  const trimmedName = computed(() => playerName.value.trim())

  function setPlayerName(name: string) {
    playerName.value = name
  }

  function markPending(matchId: string) {
    if (!pendingMatchIds.value.includes(matchId)) {
      pendingMatchIds.value = [...pendingMatchIds.value, matchId]
    }
  }

  function clearPending(matchId: string) {
    pendingMatchIds.value = pendingMatchIds.value.filter((item) => item !== matchId)
  }

  return {
    playerName,
    trimmedName,
    pendingMatchIds,
    setPlayerName,
    markPending,
    clearPending
  }
}
