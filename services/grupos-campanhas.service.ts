import { authorizedGet, authorizedPost, authorizedPut, authorizedDelete } from './api-core'

// --- Types ---

export interface GrupoCampanha {
  id: number
  grupo: string
  ativo: boolean
  idfila: number
  nome_fila?: string
  alias_fila?: string
  extensao_fila?: string
  fila_ativa?: boolean
  idorgao?: number
  nome_orgao?: string
  idoperacao?: number
  nome_operacao?: string
  data_cadastro: string
  data_atualizacao?: string
  campanhas?: any[]
  total_campanhas?: number
  origens?: number[]
}

interface GrupoCampanhaRaw {
  idgrupodecampanha: number
  grupo: string
  ativo: { type: 'Buffer'; data: number[] } | boolean | number
  idfila: number
  nome_fila?: string
  alias_fila?: string
  extensao_fila?: string
  fila_ativa?: { type: 'Buffer'; data: number[] } | boolean | number
  idorgao?: number
  nome_orgao?: string
  idoperacao?: number
  nome_operacao?: string
  dtcadastro: string
  data_atualizacao?: string
  campanhas?: any[]
  total_campanhas?: number
  origens?: number[]
}

export interface ListarGruposParams {
  page?: number
  limit?: number
  grupo?: string
  ativo?: boolean
  fila?: string
  idfila?: number
  dataInicio?: string
  dataFim?: string
  simple?: boolean
}

export interface CriarGrupoPayload {
  grupo: string
  idfila?: number
  idorgao?: number
  ativo?: boolean
  campanhas?: number[]
}

export interface CriarGruposLotePayload {
  grupos: Array<{ grupo: string; idorgao?: number; idoperacao?: number }>
}

export interface AtualizarGrupoPayload {
  grupo?: string
  idfila?: number
  idorgao?: number
  ativo?: boolean
  campanhas?: number[]
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface ListarGruposResponse {
  success: boolean
  data: { grupos: GrupoCampanha[]; pagination: Pagination }
  message?: string
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

const mapGrupoCampanha = (raw: GrupoCampanhaRaw): GrupoCampanha => ({
  id: raw.idgrupodecampanha,
  grupo: raw.grupo,
  ativo: parseAtivoField(raw.ativo),
  idfila: raw.idfila,
  nome_fila: raw.nome_fila,
  alias_fila: raw.alias_fila,
  extensao_fila: raw.extensao_fila,
  fila_ativa: raw.fila_ativa ? parseAtivoField(raw.fila_ativa) : undefined,
  idorgao: raw.idorgao,
  nome_orgao: raw.nome_orgao,
  idoperacao: raw.idoperacao,
  nome_operacao: raw.nome_operacao,
  data_cadastro: raw.dtcadastro,
  data_atualizacao: raw.data_atualizacao,
  campanhas: raw.campanhas || [],
  total_campanhas: raw.total_campanhas || 0,
  origens: raw.origens || [],
})

// --- API ---

export const listarGruposCampanhas = async (params: ListarGruposParams = {}): Promise<ListarGruposResponse> => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.grupo) queryParams.append('grupo', params.grupo)
  if (params.ativo !== undefined) queryParams.append('ativo', params.ativo.toString())
  if (params.fila) queryParams.append('fila', params.fila)
  if (params.idfila) queryParams.append('idfila', params.idfila.toString())
  if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio)
  if (params.dataFim) queryParams.append('dataFim', params.dataFim)
  if (params.simple) queryParams.append('simple', 'true')

  const path = `/grupos-campanhas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const rawResponse = await authorizedGet<{ success?: boolean; data: GrupoCampanhaRaw[]; pagination?: Pagination; message?: string }>(path)

  const grupos = Array.isArray(rawResponse.data) ? rawResponse.data.map(mapGrupoCampanha) : []

  return {
    success: rawResponse.success ?? true,
    data: {
      grupos,
      pagination: rawResponse.pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        total: grupos.length,
        totalPages: 1,
        hasMore: false,
      },
    },
    message: rawResponse.message,
  }
}

export const criarGrupoCampanha = async (dados: CriarGrupoPayload) => {
  const response = await authorizedPost<{ success: boolean; data?: GrupoCampanhaRaw; message?: string }>('/grupos-campanhas', dados)
  return {
    success: response.success ?? true,
    data: response.data ? mapGrupoCampanha(response.data) : undefined,
    message: response.message,
  }
}

export const criarGruposCampanhasLote = async (dados: CriarGruposLotePayload) => {
  const response = await authorizedPost<{ success: boolean; data?: { created: number; failed: number }; message?: string }>('/grupos-campanhas/lote', dados)
  return { success: response.success ?? true, data: response.data, message: response.message }
}

export const atualizarGrupoCampanha = async (id: number, dados: AtualizarGrupoPayload) => {
  const response = await authorizedPut<{ success: boolean; data?: GrupoCampanhaRaw; message?: string }>(`/grupos-campanhas/${id}`, dados)
  return {
    success: response.success ?? true,
    data: response.data ? mapGrupoCampanha(response.data) : undefined,
    message: response.message,
  }
}

export const atualizarStatusGrupoCampanha = async (id: number, ativo: boolean) => {
  const response = await authorizedPut<{ success: boolean; message?: string }>(`/grupos-campanhas/${id}/status`, { ativo })
  return { success: response.success ?? true, message: response.message }
}

export const excluirGrupoCampanha = async (id: number) => {
  const response = await authorizedDelete<{ success: boolean; message?: string }>(`/grupos-campanhas/${id}`)
  return { success: response.success ?? true, message: response.message }
}
