<template>
  <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-slate-700">First date</span>
      <input v-model="startDate" type="date" class="field" required />
    </label>
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-slate-700">Level</span>
      <input v-model="level" class="field" placeholder="Low Bronze" required />
    </label>
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-slate-700">Start time</span>
      <input v-model="startTime" type="time" class="field" required />
    </label>
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-slate-700">End time</span>
      <input v-model="endTime" type="time" class="field" required />
    </label>
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-slate-700">Status</span>
      <select v-model="status" class="field">
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>
    </label>
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-slate-700">Repeat for weeks</span>
      <input v-model.number="repeatWeeks" type="number" min="2" max="16" class="field" required />
    </label>
    <div class="md:col-span-2">
      <button class="btn-primary" :disabled="submitting">
        {{ submitting ? 'Generating...' : 'Generate recurring matches' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MatchStatus } from '../../lib/types'

const emit = defineEmits<{
  submit: [
    values: {
      startDate: string
      startTime: string
      endTime: string
      level: string
      status: MatchStatus
      repeatWeeks: number
    }
  ]
}>()

defineProps<{ submitting?: boolean }>()

const startDate = ref('')
const startTime = ref('')
const endTime = ref('')
const level = ref('')
const status = ref<MatchStatus>('open')
const repeatWeeks = ref(6)

function handleSubmit() {
  emit('submit', {
    startDate: startDate.value,
    startTime: startTime.value,
    endTime: endTime.value,
    level: level.value,
    status: status.value,
    repeatWeeks: repeatWeeks.value
  })
}
</script>
