import { authorizedGet, authorizedPost, authorizedPatch, authorizedDelete } from './api-core'

export interface Usuario {
  idusuario: number
  nome: string
  usuario: string
  email: string
  cpf?: string
  telefone_celular?: string
  ramal?: string
  apelido?: string
  ativo: boolean
}

export interface CreateUsuarioPayload {
  nome: string
  email: string
  cpf?: string
  telefone_celular?: string
  ramal?: string
  apelido?: string
  ativo?: boolean
}

export interface UpdateUsuarioPayload {
  nome?: string
  email?: string
  telefone_celular?: string
  ramal?: string
  apelido?: string
  ativo?: boolean
}

export const listUsuarios = () => authorizedGet<{ data: Usuario[] }>('/users').then((res) => res.data)

export const getUsuario = (id: number) =>
  authorizedGet<{ data: Usuario }>(`/users/${id}`).then((res) => res.data)

export const createUsuario = (data: CreateUsuarioPayload) => authorizedPost('/users', data)

export const updateUsuario = (id: number, data: UpdateUsuarioPayload) =>
  authorizedPatch(`/users/${id}`, data)

export const deleteUsuario = (id: number) => authorizedDelete(`/users/${id}`)

export const resetSenhaUsuario = (id: number) => authorizedPost(`/users/${id}/reset-senha`)
