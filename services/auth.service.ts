import { publicPost, authorizedGet, authorizedPost } from './api-core'

export const login = (usuario: string, senha: string) => publicPost('/login', { usuario, senha })

export const logout = () => authorizedPost('/logout', null)

export const getMe = () => authorizedGet('/me')
