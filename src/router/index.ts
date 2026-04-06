import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import MatchPage from '../pages/MatchPage.vue'
import AdminLoginPage from '../pages/admin/AdminLoginPage.vue'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.vue'
import { supabase } from '../lib/supabase'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/week/current' },
    { path: '/week/current', name: 'week-current', component: HomePage },
    { path: '/week/:weekId', name: 'week', component: HomePage, props: true },
    { path: '/match/:id', name: 'match', component: MatchPage, props: true },
    { path: '/admin/login', name: 'admin-login', component: AdminLoginPage },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: AdminDashboardPage,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const { data } = await supabase.auth.getSession()

  if (!data.session) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
