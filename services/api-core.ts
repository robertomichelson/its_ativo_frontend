import type { AxiosRequestConfig, AxiosInstance } from 'axios'

function getApiInstance(): AxiosInstance {
  const { $api } = useNuxtApp()
  return $api
}

/**
 * GET autorizado via cookie
 */
export async function authorizedGet<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const api = getApiInstance()
  const response = await api.get(url, {
    withCredentials: true,
    ...config,
  })
  return response.data
}

/**
 * POST autorizado via cookie
 */
export async function authorizedPost<T = any>(
  url: string,
  data: any = {},
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const api = getApiInstance()
  const headers = { ...customHeaders }

  if (data instanceof FormData) {
    delete headers['Content-Type']
  }

  const response = await api.post(url, data, {
    headers,
    withCredentials: true,
  })
  return response.data
}

/**
 * PATCH autorizado via cookie
 */
export async function authorizedPatch<T = any>(
  url: string,
  data: any = {},
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const api = getApiInstance()
  const headers = { ...customHeaders }

  if (data instanceof FormData) {
    delete headers['Content-Type']
  }

  const response = await api.patch(url, data, {
    headers,
    withCredentials: true,
  })
  return response.data
}

/**
 * PUT autorizado via cookie
 */
export async function authorizedPut<T = any>(
  url: string,
  data: any = {},
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const api = getApiInstance()
  const headers = { ...customHeaders }

  if (data instanceof FormData) {
    delete headers['Content-Type']
  }

  const response = await api.put(url, data, {
    headers,
    withCredentials: true,
  })
  return response.data
}

/**
 * DELETE autorizado via cookie
 */
export async function authorizedDelete<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const api = getApiInstance()
  const response = await api.delete(url, {
    withCredentials: true,
    data,
    ...config,
  })
  return response.data
}

/**
 * GET publico (sem autenticacao)
 */
export async function publicGet<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const api = getApiInstance()
  const response = await api.get(url, config)
  return response.data
}

/**
 * POST publico (sem autenticacao)
 */
export async function publicPost<T = any>(
  url: string,
  data: any = {},
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const api = getApiInstance()
  const headers = { ...customHeaders }

  if (data instanceof FormData) {
    delete headers['Content-Type']
  }

  const response = await api.post(url, data, { headers })
  return response.data
}
