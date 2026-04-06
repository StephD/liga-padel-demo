<template>
  <AppShell>
    <div class="mx-auto max-w-md">
      <section class="panel p-6">
        <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Admin access</p>
        <h1 class="mt-3 font-display text-3xl font-bold">Sign in to manage matches</h1>
        <form class="mt-6 space-y-4" @submit.prevent="login">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <input v-model="email" type="email" class="field" required />
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-slate-700">Password</span>
            <input v-model="password" type="password" class="field" required />
          </label>
          <p v-if="errorMessage" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ errorMessage }}</p>
          <button class="btn-primary w-full" :disabled="submitting">
            {{ submitting ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </section>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '../../layouts/AppShell.vue'
import { supabase } from '../../lib/supabase'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

async function login() {
  submitting.value = true
  errorMessage.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  submitting.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  router.push(String(route.query.redirect ?? '/admin'))
}
</script>
