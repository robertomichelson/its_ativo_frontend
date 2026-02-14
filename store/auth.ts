import { defineStore } from 'pinia'
import { login as apiLogin, getMe, logout } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const ready = ref(false)

  const userName = computed(() => user.value?.nome || 'Usuario')
  const isAuthenticated = computed(() => !!user.value)

  const getRedirectPath = () => {
    if (!user.value) return '/auth'
    return '/home'
  }

  const login = async (email: string, senha: string) => {
    try {
      const { retorno } = await apiLogin(email, senha)
      user.value = retorno
      return true
    } catch (error: any) {
      throw new Error(error.response?.data?.mensagem || 'Erro ao fazer login')
    }
  }

  const restoreSession = async () => {
    ready.value = false
    if (!import.meta.client) return

    try {
      const { retorno } = await getMe()
      user.value = retorno
    } catch (err) {
      logout()
    } finally {
      ready.value = true
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    restoreSession,
    ready,
    userName,
    getRedirectPath,
  }
})
