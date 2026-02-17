import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { toast } from 'vue-sonner'
import {
  listarGruposCampanhas,
  criarGrupoCampanha,
  atualizarGrupoCampanha,
  atualizarStatusGrupoCampanha,
  excluirGrupoCampanha,
  criarGruposCampanhasLote,
  type GrupoCampanha,
  type ListarGruposParams,
  type CriarGrupoPayload,
  type AtualizarGrupoPayload,
  type CriarGruposLotePayload,
} from '~/services/grupos-campanhas.service'

export const useGruposCampanhas = () => {
  const grupos = ref<GrupoCampanha[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const paginacao = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
  })

  const filtros = ref({
    grupo: '',
    ativo: true as boolean | undefined,
    fila: '',
    dataInicio: '',
    dataFim: '',
  })

  const temDados = computed(() => grupos.value.length > 0)
  const estaVazio = computed(() => !loading.value && grupos.value.length === 0)

  const buscarGrupos = async (resetPagina = false, opcoes: { simple?: boolean } = {}) => {
    try {
      loading.value = true
      error.value = null

      if (resetPagina) paginacao.value.page = 1

      const params: ListarGruposParams = {
        page: paginacao.value.page,
        limit: paginacao.value.limit,
        ...(opcoes.simple && { simple: true }),
        ...Object.fromEntries(
          Object.entries(filtros.value).filter(([_, value]) => {
            if (typeof value === 'string') return value !== ''
            if (typeof value === 'boolean') return true
            return value !== undefined && value !== null
          }),
        ),
      }

      const response = await listarGruposCampanhas(params)

      if (response.success) {
        grupos.value = response.data.grupos
        paginacao.value = { ...paginacao.value, ...response.data.pagination }
      } else {
        throw new Error(response.message || 'Erro ao buscar grupos de campanhas')
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar grupos de campanhas'
      toast.error(error.value!)
      console.error('Erro ao buscar grupos:', err)
    } finally {
      loading.value = false
    }
  }

  const filtrar = useDebounceFn(() => {
    buscarGrupos(true)
  }, 500)

  const iniciarFiltragem = () => {
    loading.value = true
    filtrar()
  }

  const limparFiltros = () => {
    filtros.value = { grupo: '', ativo: true, fila: '', dataInicio: '', dataFim: '' }
    buscarGrupos(true)
  }

  const mudarPagina = (novaPagina: number) => {
    paginacao.value.page = novaPagina
    buscarGrupos()
  }

  const mudarTamanhoPagina = (novoTamanho: number) => {
    paginacao.value.limit = novoTamanho
    paginacao.value.page = 1
    buscarGrupos()
  }

  const toggleStatus = async (grupo: GrupoCampanha) => {
    try {
      loading.value = true
      const novoStatus = !grupo.ativo
      const response = await atualizarStatusGrupoCampanha(grupo.id, novoStatus)

      if (response.success) {
        const index = grupos.value.findIndex((g) => g.id === grupo.id)
        if (index !== -1) grupos.value[index].ativo = novoStatus
        toast.success(`Grupo ${novoStatus ? 'ativado' : 'inativado'} com sucesso`)
      } else {
        throw new Error(response.message || 'Erro ao alterar status do grupo')
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao alterar status do grupo'
      toast.error(error.value!)
    } finally {
      loading.value = false
    }
  }

  const criar = async (dados: CriarGrupoPayload) => {
    try {
      loading.value = true
      const response = await criarGrupoCampanha(dados)
      if (response.success) {
        toast.success('Grupo criado com sucesso')
        await buscarGrupos(true)
        return response.data
      } else {
        throw new Error(response.message || 'Erro ao criar grupo')
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao criar grupo'
      toast.error(error.value!)
      throw err
    } finally {
      loading.value = false
    }
  }

  const criarEmLote = async (dados: CriarGruposLotePayload) => {
    try {
      loading.value = true
      const response = await criarGruposCampanhasLote(dados)
      if (response.success) {
        await buscarGrupos(true)
        const { created, failed } = response.data || { created: 0, failed: 0 }
        if (failed > 0) {
          toast.warning(response.message || `${created} criados, ${failed} falharam`)
        } else {
          toast.success(response.message || `${created} grupos criados`)
        }
        return response.data
      } else {
        throw new Error(response.message || 'Erro ao criar grupos em lote')
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao criar grupos em lote'
      toast.error(error.value!)
      throw err
    } finally {
      loading.value = false
    }
  }

  const atualizar = async (id: number, dados: AtualizarGrupoPayload) => {
    try {
      loading.value = true
      const response = await atualizarGrupoCampanha(id, dados)
      if (response.success) {
        toast.success('Grupo atualizado com sucesso')
        if (response.data) {
          const index = grupos.value.findIndex((g) => g.id === id)
          if (index !== -1) grupos.value[index] = response.data
        }
        await buscarGrupos()
        return response.data
      } else {
        throw new Error(response.message || 'Erro ao atualizar grupo')
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao atualizar grupo'
      toast.error(error.value!)
      throw err
    } finally {
      loading.value = false
    }
  }

  const excluir = async (grupo: GrupoCampanha) => {
    try {
      loading.value = true
      const response = await excluirGrupoCampanha(grupo.id)
      if (response.success) {
        grupos.value = grupos.value.filter((g) => g.id !== grupo.id)
        toast.success('Grupo excluido com sucesso')
        if (grupos.value.length === 0 && paginacao.value.page > 1) {
          mudarPagina(paginacao.value.page - 1)
        }
      } else {
        throw new Error(response.message || 'Erro ao excluir grupo')
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao excluir grupo'
      toast.error(error.value!)
    } finally {
      loading.value = false
    }
  }

  const statusOptions = [
    { label: 'Todos', value: undefined },
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false },
  ]

  return {
    grupos,
    loading,
    error,
    paginacao,
    filtros,
    temDados,
    estaVazio,
    buscarGrupos,
    criar,
    criarEmLote,
    atualizar,
    filtrar,
    iniciarFiltragem,
    limparFiltros,
    mudarPagina,
    mudarTamanhoPagina,
    toggleStatus,
    excluir,
    statusOptions,
  }
}
