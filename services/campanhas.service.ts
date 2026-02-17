import { authorizedGet, authorizedPost, authorizedPut } from './api-core'

// --- Types ---

export interface Campanha {
  idcampanha: number
  campanha: string
  nome_operacao: string
  nome_banco: string | null
  nome_orgao: string
  idoperacao?: number
  idbanco?: number | null
  idorgao?: number
  tipo?: number
  descricao?: string | null
  ativa?: boolean
  expiraem?: string
  dtcadastro?: string
  total_clientes?: number
  total_telefones?: number
  total_clientes_trabalhados?: number
  total_clientes_nao_trabalhados?: number
  total_verificados?: number
  total_lemit?: number
  total_lemitplus?: number
  total_verificados_trabalhados?: number
  total_lemit_trabalhados?: number
  total_lemitplus_trabalhados?: number
  origens?: Array<{ id: number; nome: string; total: number }>
}

interface CampanhaRaw {
  idcampanha: number
  campanha: string
  ativo: { type: 'Buffer'; data: number[] } | boolean | number
  tipo?: number
  descricao?: string | null
  nome_operacao: string
  nome_banco: string | null
  nome_orgao: string
  idoperacao?: number
  idbanco?: number | null
  idorgao?: number
  expiraem?: string
  dtcadastro?: string
  total_clientes?: number
  total_telefones?: number
  total_clientes_trabalhados?: number
  total_clientes_nao_trabalhados?: number
  total_verificados?: number
  total_lemit?: number
  total_lemitplus?: number
  total_verificados_trabalhados?: number
  total_lemit_trabalhados?: number
  total_lemitplus_trabalhados?: number
  origens?: Array<{ id: number; nome: string; total: number }>
}

export interface ListarCampanhasParams {
  page?: number
  limit?: number
  idoperacao?: number
  idorgao?: number
  idbanco?: number
  campanha?: string
  ativa?: boolean
  idgrupocampanha?: number
  tipo?: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface ListarCampanhasResponse {
  success: boolean
  data: Campanha[]
  pagination: Pagination
  message?: string
}

export interface CriarCampanhaPayload {
  campanha: string
  tipo: number
  idoperacao?: number
  idorgao?: number
  expiraem: string
  idgrupocampanha?: number
  ativo?: boolean
  descricao?: string
  idbanco?: number
  clientes?: number[]
  cpfs?: string[]
  idusuario?: number
  idstatus?: number
  dtvalidade?: string
}

export interface CriarCampanhaResponse {
  success: boolean
  data: { idcampanha: number }
  message: string
}

// --- Helpers ---

const parseAtivoField = (ativo: { type: 'Buffer'; data: number[] } | boolean | number): boolean => {
  if (typeof ativo === 'boolean') return ativo
  if (typeof ativo === 'number') return ativo === 1
  if (ativo && typeof ativo === 'object' && ativo.type === 'Buffer' && ativo.data) {
    return ativo.data[0] === 1
  }
  return false
}

const mapCampanha = (raw: CampanhaRaw): Campanha => ({
  idcampanha: raw.idcampanha,
  campanha: raw.campanha,
  ativa: parseAtivoField(raw.ativo),
  tipo: raw.tipo,
  descricao: raw.descricao,
  nome_operacao: raw.nome_operacao,
  nome_banco: raw.nome_banco,
  nome_orgao: raw.nome_orgao,
  idoperacao: raw.idoperacao,
  idbanco: raw.idbanco,
  idorgao: raw.idorgao,
  expiraem: raw.expiraem,
  dtcadastro: raw.dtcadastro,
  total_clientes: raw.total_clientes,
  total_telefones: raw.total_telefones,
  total_clientes_trabalhados: raw.total_clientes_trabalhados,
  total_clientes_nao_trabalhados: raw.total_clientes_nao_trabalhados,
  total_verificados: raw.total_verificados,
  total_lemit: raw.total_lemit,
  total_lemitplus: raw.total_lemitplus,
  total_verificados_trabalhados: raw.total_verificados_trabalhados,
  total_lemit_trabalhados: raw.total_lemit_trabalhados,
  total_lemitplus_trabalhados: raw.total_lemitplus_trabalhados,
  origens: raw.origens,
})

// --- API ---

export const listarCampanhas = async (params: ListarCampanhasParams = {}): Promise<ListarCampanhasResponse> => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.idoperacao) queryParams.append('idoperacao', params.idoperacao.toString())
  if (params.idorgao) queryParams.append('idorgao', params.idorgao.toString())
  if (params.idbanco) queryParams.append('idbanco', params.idbanco.toString())
  if (params.campanha) queryParams.append('campanha', params.campanha)
  if (params.ativa !== undefined) queryParams.append('ativa', params.ativa.toString())
  if (params.tipo !== undefined) queryParams.append('tipo', params.tipo.toString())

  const path = `/campanhas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const rawResponse = await authorizedGet<{ success?: boolean; data: CampanhaRaw[]; pagination?: Pagination; message?: string }>(path)

  const campanhas = Array.isArray(rawResponse.data) ? rawResponse.data.map(mapCampanha) : []

  return {
    success: rawResponse.success ?? true,
    data: campanhas,
    pagination: rawResponse.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      total: campanhas.length,
      totalPages: 1,
      hasMore: false,
    },
    message: rawResponse.message,
  }
}

export const obterCampanha = async (id: number) => {
  const response = await authorizedGet<{ success: boolean; data: any; message?: string }>(`/campanhas/${id}`)
  if (response.data && response.data.ativo !== undefined) {
    response.data.ativa = parseAtivoField(response.data.ativo)
  }
  return response
}

export const criarCampanha = async (payload: CriarCampanhaPayload): Promise<CriarCampanhaResponse> => {
  return await authorizedPost<CriarCampanhaResponse>('/campanhas', payload)
}

export const atualizarStatusCampanha = async (id: number, ativo: boolean): Promise<{ success: boolean; message?: string }> => {
  const response = await authorizedPut<{ success: boolean; message?: string }>(`/campanhas/${id}/status`, { ativo })
  return { success: response.success ?? true, message: response.message }
}
