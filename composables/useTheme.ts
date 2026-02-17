import { ref, watch } from 'vue'

const isDark = ref(false)

export function useTheme() {
  if (import.meta.client) {
    isDark.value = localStorage.getItem('theme') === 'dark'
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  watch(isDark, (val) => {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', val)
      localStorage.setItem('theme', val ? 'dark' : 'light')
    }
  })

  const toggle = () => { isDark.value = !isDark.value }

  return { isDark, toggle }
}
