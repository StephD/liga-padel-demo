<template>
  <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-slate-700">Date</span>
      <input v-model="form.date" type="date" class="field" required />
    </label>
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-slate-700">Level</span>
      <input v-model="form.level" class="field" placeholder="High Silver" required />
    </label>
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-slate-700">Start time</span>
      <input v-model="form.start_time" type="time" class="field" required />
    </label>
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-slate-700">End time</span>
      <input v-model="form.end_time" type="time" class="field" required />
    </label>
    <label class="block md:col-span-2">
      <span class="mb-2 block text-sm font-semibold text-slate-700">Status</span>
      <select v-model="form.status" class="field">
        <option value="open">Open</option>
        <option value="full">Full</option>
        <option value="closed">Closed</option>
      </select>
    </label>

    <div class="md:col-span-2 flex gap-3">
      <button class="btn-primary" :disabled="submitting">{{ submitLabel }}</button>
      <button v-if="showCancel" type="button" class="btn-secondary" @click="$emit('cancel')">Cancel</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { getWeekId } from '../../lib/utils'
import type { MatchFormValues, MatchStatus } from '../../lib/types'

const props = defineProps<{
  initialValues?: Partial<MatchFormValues>
  submitting?: boolean
  showCancel?: boolean
}>()

const emit = defineEmits<{
  submit: [values: MatchFormValues]
  cancel: []
}>()

const form = reactive<MatchFormValues>({
  date: '',
  start_time: '',
  end_time: '',
  level: '',
  status: 'open' as MatchStatus,
  week_label: ''
})

watch(
  () => props.initialValues,
  (value) => {
    Object.assign(form, {
      date: value?.date ?? '',
      start_time: value?.start_time ?? '',
      end_time: value?.end_time ?? '',
      level: value?.level ?? '',
      status: value?.status ?? 'open',
      week_label: value?.week_label ?? (value?.date ? getWeekId(value.date) : '')
    })
  },
  { immediate: true }
)

const submitLabel = computed(() => (props.submitting ? 'Saving...' : 'Save match'))

function handleSubmit() {
  emit('submit', {
    ...form,
    week_label: getWeekId(form.date)
  })
}
</script>
