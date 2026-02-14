import axios from 'axios'
import type { AxiosInstance } from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api: AxiosInstance = axios.create({
    baseURL: config.public.apiBaseUrl as string,
    withCredentials: true,
    adapter: 'xhr',
  })

  return {
    provide: {
      api,
    },
  }
})
