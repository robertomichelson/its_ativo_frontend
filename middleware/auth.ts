import { useAuthStore } from '~/store/auth'

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (!import.meta.client) return

  if (!auth.ready) {
    await auth.restoreSession()
  }

  if (!auth.isAuthenticated) {
    return navigateTo('/auth')
  }
})
