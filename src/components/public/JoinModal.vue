<template>
  <div class="fixed inset-0 z-50 flex items-end bg-slate-950/45 sm:items-center sm:justify-center">
    <div class="w-full rounded-t-[2rem] bg-white p-5 sm:max-w-md sm:rounded-[2rem]">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Join waiting list</p>
          <h3 class="mt-2 font-display text-2xl font-bold text-ink">{{ title }}</h3>
        </div>
        <button class="btn-secondary px-3 py-2 text-xs" @click="$emit('close')">Close</button>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="submitForm">
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700">Your name</span>
          <input v-model="localName" class="field" maxlength="40" placeholder="Alex Tan" required />
        </label>

        <p class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Joining adds you to the waiting list. An admin will approve players into the first available slot.
        </p>

        <p v-if="error" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>

        <button class="btn-primary w-full" :disabled="submitting">
          {{ submitting ? 'Joining...' : 'Confirm join' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  title: string
  submitting?: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  submit: [value: string]
  'update:modelValue': [value: string]
}>()

const localName = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    localName.value = value
  }
)

watch(localName, (value) => emit('update:modelValue', value))

function submitForm() {
  emit('submit', localName.value)
}
</script>
