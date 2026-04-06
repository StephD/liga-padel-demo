<template>
  <button class="btn-secondary" @click="share">
    {{ copied ? 'Copied link text' : 'Share' }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  text: string
}>()

const copied = ref(false)

async function share() {
  if (navigator.share) {
    await navigator.share({ text: props.text })
    return
  }

  await navigator.clipboard.writeText(props.text)
  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 1800)
}
</script>
