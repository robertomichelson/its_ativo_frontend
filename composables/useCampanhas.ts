import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import {
  listarCampanhas,
  atualizarStatusCampanha,
  type Campanha,
  type ListarCampanhasParams,
} from '~/services/campanhas.service'

// Estado global compartilhado (persistido entre navegacoes)
const estadoGlobal = {
  campanhas: ref<Campanha[]>([]),
  loading: ref(true),
  error: ref<string | null>(null),
  paginacao: ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
  }),
  filtros: ref<ListarCampanhasParams>({}),
  scrollPosition: ref(0),
  dataCarregada: ref(false),
}

export const useCampanhas = () => {
  const campanhas = estadoGlobal.campanhas
  const loading = estadoGlobal.loading
  const error = estadoGlobal.error
  const paginacao = estadoGlobal.paginacao
  const filtros = estadoGlobal.filtros
  const scrollPosition = estadoGlobal.scrollPosition
  const dataCarregada = estadoGlobal.dataCarregada

  const campanhasOptions = computed(() =>
    campanhas.value.map((c) => ({
      label: c.campanha,
      value: c.idcampanha,
      ...c,
    })),
  )

  const temCampanhas = computed(() => campanhas.value.length > 0)

  const buscarCampanhas = async (params: ListarCampanhasParams = {}) => {
    try {
      loading.value = true
      error.value = null

      filtros.value = {
        page: paginacao.value.page,
        limit: paginacao.value.limit,
        ...params,
      }

      const response = await listarCampanhas(filtros.value)

      if (response.success) {
        campanhas.value = response.data
        paginacao.value = { ...paginacao.value, ...response.pagination }
        dataCarregada.value = true
      } else {
        throw new Error(response.message || 'Erro ao buscar campanhas')
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar campanhas'
      toast.error(error.value!)
      console.error('Erro ao buscar campanhas:', err)
    } finally {
      loading.value = false
    }
  }

  const toggleStatus = async (campanha: Campanha) => {
    try {
      loading.value = true
      const novoStatus = !campanha.ativa
      const response = await atualizarStatusCampanha(campanha.idcampanha, novoStatus)

      if (response.success) {
        const index = campanhas.value.findIndex((c) => c.idcampanha === campanha.idcampanha)
        if (index !== -1) {
          campanhas.value[index].ativa = novoStatus
        }
        toast.success(`Campanha ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`)
      } else {
        throw new Error(response.message || 'Erro ao alterar status da campanha')
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao alterar status da campanha'
      toast.error(error.value!)
      console.error('Erro ao alterar status:', err)
    } finally {
      loading.value = false
    }
  }

  const salvarScrollPosition = (position: number) => {
    scrollPosition.value = position
  }

  const resetarEstado = () => {
    campanhas.value = []
    paginacao.value = { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false }
    filtros.value = {}
    scrollPosition.value = 0
    dataCarregada.value = false
  }

  return {
    campanhas,
    loading,
    error,
    paginacao,
    filtros,
    scrollPosition,
    dataCarregada,
    campanhasOptions,
    temCampanhas,
    buscarCampanhas,
    toggleStatus,
    salvarScrollPosition,
    resetarEstado,
  }
}
