import { useAuthStore } from '~/store/auth'

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (!import.meta.client) return

  if (!auth.ready) {
    await auth.restoreSession()
  }

  const perfis: number[] = auth.user?.idperfil || []
  const isAdmin = perfis.includes(1)

  if (!isAdmin) {
    return navigateTo('/home')
  }
})
