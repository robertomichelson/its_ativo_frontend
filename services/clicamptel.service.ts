import { authorizedGet, authorizedPost, authorizedDelete } from './api-core'

// --- Types ---

export interface ClienteCampanha {
  idclicamptel: number
  idcampanha: number
  idusuario: number
  idtelefone?: number
  idstatus?: number
  dtinsert: string
  agendadopara?: string
  tentativas: number
  situacao: number
  ativo: boolean
  stormfin_cliente_id?: string
  // Dados do cliente
  idcliente: number
  cpf?: string
  nome?: string
  data_nasc?: string
  // Dados da campanha
  nome_campanha?: string
  // Telefone
  ddd?: string
  telefone?: string
  numero_telefone?: string
  // Origem
  origem?: { id: number; nome: string } | null
}

export interface ListarClientesCampanhaParams {
  page?: number
  limit?: number
  ativo?: boolean
  idstatus?: number
  cpf?: string
  nome?: string
  telefone?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface ListarClientesCampanhaResponse {
  success: boolean
  data: ClienteCampanha[]
  pagination: Pagination
  message?: string
}

// --- API ---

export const listarClientesPorCampanha = async (
  idCampanha: number,
  params: ListarClientesCampanhaParams = {},
): Promise<ListarClientesCampanhaResponse> => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.ativo !== undefined) queryParams.append('ativo', params.ativo.toString())
  if (params.idstatus !== undefined) queryParams.append('idstatus', params.idstatus.toString())
  if (params.cpf) queryParams.append('cpf', params.cpf)
  if (params.nome) queryParams.append('nome', params.nome)
  if (params.telefone) queryParams.append('telefone', params.telefone)

  const path = `/clicamptel/campanha/${idCampanha}/clientes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const response = await authorizedGet<ListarClientesCampanhaResponse>(path)

  return {
    success: response.success ?? true,
    data: response.data || [],
    pagination: response.pagination || {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      total: 0,
      totalPages: 0,
      hasMore: false,
    },
    message: response.message,
  }
}

export const adicionarClientesCampanha = async (
  idCampanha: number,
  clientes: number[],
  idusuario: number,
) => {
  return await authorizedPost<{ success: boolean; data?: any; message?: string }>(
    `/clicamptel/campanha/${idCampanha}/clientes`,
    { clientes, idusuario },
  )
}

export const removerClienteCampanha = async (idCampanha: number, idCliente: number) => {
  return await authorizedDelete<{ success: boolean; message?: string }>(
    `/clicamptel/campanha/${idCampanha}/cliente/${idCliente}`,
  )
}

export const removerClientesCampanha = async (idCampanha: number, clientes: number[]) => {
  return await authorizedDelete<{ success: boolean; data?: { total_removidos: number; total_nao_encontrados: number }; message?: string }>(
    `/clicamptel/campanha/${idCampanha}/clientes`,
    { clientes },
  )
}
