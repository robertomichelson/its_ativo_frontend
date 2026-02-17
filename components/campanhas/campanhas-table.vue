<template>
  <div>
    <!-- Filtros -->
    <q-card class="q-mb-md" flat bordered style="border-radius: 12px">
      <q-card-section>
        <div class="text-subtitle2 text-weight-bold q-mb-sm" style="color: #374151">FILTROS</div>
        <div class="row q-col-gutter-md">
          <div class="col-xs-12 col-sm-6 col-md-3">
            <q-input
              v-model="filtros.campanha"
              label="Nome da Campanha"
              color="deep-orange"
              outlined
              dense
              clearable
              @update:model-value="debouncedFiltrar"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="col-xs-12 col-sm-6 col-md-3">
            <q-select
              v-model="filtros.ativa"
              :options="statusOptions"
              label="Status"
              outlined
              color="deep-orange"
              dense
              clearable
              emit-value
              map-options
              @update:model-value="filtrar"
            />
          </div>

          <div class="col-12 col-md-1">
            <q-btn unelevated color="grey-6" label="Limpar" @click="limparFiltros" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Botao Nova Lista -->
    <div class="q-mb-md flex justify-start">
      <q-btn
        label="Nova Lista"
        icon="add"
        no-caps
        unelevated
        class="btn-create"
        @click="modalCriarCampanha = true"
      />
    </div>

    <!-- Tabela -->
    <div class="table-container">
      <div v-if="loading && campanhas.length > 0" class="table-loading-overlay">
        <q-spinner-dots size="3em" color="deep-orange" />
      </div>

      <q-table
        :rows="campanhas"
        :columns="columns as any"
        v-model:pagination="paginacaoTabela"
        :rows-per-page-options="[10, 20, 50, 100]"
        rows-per-page-label="Registros por pagina:"
        @request="onRequest"
        row-key="idcampanha"
        flat
        bordered
        class="campanhas-table"
        :class="{ 'table-loading': loading && campanhas.length > 0 }"
      >
        <!-- Status -->
        <template #body-cell-ativa="props">
          <q-td :props="props" class="text-center">
            <div
              class="status-indicator"
              :class="props.value ? 'status-active' : 'status-inactive'"
              :title="props.value ? 'Ativa' : 'Inativa'"
            >
              <div class="status-glow"></div>
            </div>
          </q-td>
        </template>

        <!-- Orgao -->
        <template #body-cell-orgao="props">
          <q-td :props="props">
            <q-chip v-if="props.value" :label="props.value" color="grey-3" text-color="grey-8" dense />
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>

        <!-- Operacao -->
        <template #body-cell-operacao="props">
          <q-td :props="props">
            <q-chip v-if="props.value" :label="props.value" color="deep-orange-1" text-color="deep-orange-9" dense />
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>

        <!-- Trabalhados -->
        <template #body-cell-trabalhados="props">
          <q-td :props="props">
            <div class="progress-container">
              <div class="progress-info">
                <span class="progress-text">{{ pegaPercentualTexto(props as any) }}</span>
                <span class="progress-percentage" :style="{ color: getCorPercentual(pegaPercentual(props as any)) }">
                  {{ pegaPercentual(props as any) }}%
                </span>
              </div>
              <q-linear-progress
                :value="pegaPercentual(props as any) / 100"
                :color="getCorPercentual(pegaPercentual(props as any))"
                size="8px"
                rounded
              />
            </div>
          </q-td>
        </template>

        <!-- Origens -->
        <template #body-cell-origens="props">
          <q-td :props="props">
            <div class="origens-container">
              <q-badge v-if="props.row.total_verificados > 0" color="purple-8" :label="`V: ${props.row.total_verificados}`" class="origem-badge" />
              <q-badge v-if="props.row.total_lemit > 0" color="blue-8" :label="`L: ${props.row.total_lemit}`" class="origem-badge" />
              <q-badge v-if="props.row.total_lemitplus > 0" color="orange-8" :label="`L+: ${props.row.total_lemitplus}`" class="origem-badge" />
            </div>
          </q-td>
        </template>

        <!-- Expira em -->
        <template #body-cell-expiraem="props">
          <q-td :props="props">{{ formatarData(props.value) }}</q-td>
        </template>

        <!-- Total Clientes -->
        <template #body-cell-total_clientes="props">
          <q-td :props="props" class="text-center">
            <q-badge :color="props.value > 0 ? 'green-8' : 'grey-5'" :label="props.value || 0" rounded />
          </q-td>
        </template>

        <!-- Total Telefones -->
        <template #body-cell-total_telefones="props">
          <q-td :props="props" class="text-center">
            <q-badge :color="props.value > 0 ? 'blue-8' : 'grey-5'" :label="props.value || 0" rounded />
          </q-td>
        </template>

        <!-- Data Cadastro -->
        <template #body-cell-data_cadastro="props">
          <q-td :props="props">{{ formatarData(props.value) }}</q-td>
        </template>

        <!-- Acoes -->
        <template #body-cell-acoes="props">
          <q-td :props="props">
            <q-btn
              v-if="props.row.ativa"
              flat round dense color="negative" icon="delete" size="sm"
              @click.stop="abrirModalExcluir(props.row)"
            >
              <q-tooltip>Desativar Campanha</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- No Data -->
        <template #no-data>
          <div class="full-width row flex-center q-gutter-sm text-grey-6" style="min-height: 200px; padding: 2rem">
            <div v-if="loading" class="text-center">
              <q-spinner-dots size="3em" color="deep-orange" />
              <div class="text-subtitle1 q-mt-md">Carregando campanhas...</div>
            </div>
            <div v-else class="text-center">
              <q-icon size="2em" name="inbox" />
              <div class="text-subtitle1 q-mt-sm">Nenhuma campanha encontrada</div>
              <div class="text-body2">Tente ajustar os filtros ou adicione novas campanhas</div>
            </div>
          </div>
        </template>
      </q-table>
    </div>

    <!-- Modal Criar Campanha -->
    <ModalCriarCampanha v-model="modalCriarCampanha" @campanha-criada="handleCampanhaCriada" />

    <!-- Modal Confirmacao Exclusao -->
    <q-dialog v-model="modalExcluir.show">
      <q-card style="width: 420px; border-radius: 16px">
        <q-card-section class="text-center" style="padding: 24px">
          <q-icon name="warning" size="48px" color="orange-8" />
          <div class="text-h6 q-mt-sm">Desativar campanha</div>
          <p class="text-body2 text-grey-7 q-mt-sm">
            Deseja realmente desativar a campanha <strong>"{{ modalExcluir.campanha?.campanha }}"</strong>?
          </p>
        </q-card-section>
        <q-card-actions align="right" style="padding: 12px 20px">
          <q-btn flat label="Cancelar" no-caps color="grey-7" @click="modalExcluir.show = false" />
          <q-btn unelevated label="Desativar" no-caps color="negative" :loading="modalExcluir.loading" @click="confirmarExclusao" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { format } from 'date-fns'
import { useCampanhas } from '~/composables/useCampanhas'
import { atualizarStatusCampanha } from '~/services/campanhas.service'
import { toast } from 'vue-sonner'
import ModalCriarCampanha from '~/components/campanhas/modal-criar-campanha.vue'

const {
  campanhas,
  loading,
  paginacao,
  buscarCampanhas,
} = useCampanhas()

const modalCriarCampanha = ref(false)

const modalExcluir = reactive({
  show: false,
  campanha: null as any,
  loading: false,
})

const filtros = reactive({
  campanha: '',
  ativa: true as boolean | null,
})

const statusOptions = [
  { label: 'Ativa', value: true },
  { label: 'Inativa', value: false },
]

const columns = [
  { name: 'idcampanha', label: 'ID', align: 'left', field: 'idcampanha', sortable: true },
  { name: 'ativa', label: 'Status', align: 'center', field: 'ativa' },
  { name: 'campanha', label: 'Campanha', align: 'left', field: 'campanha', sortable: true },
  { name: 'orgao', label: 'Orgao', align: 'left', field: 'nome_orgao', sortable: true },
  { name: 'operacao', label: 'Operacao', align: 'left', field: 'nome_operacao', sortable: true },
  { name: 'trabalhados', label: 'Trabalhados', align: 'left', field: 'total_clientes_trabalhados' },
  { name: 'origens', label: 'Origens', align: 'center', field: 'origens' },
  { name: 'expiraem', label: 'Expira em', align: 'left', field: 'expiraem', sortable: true },
  { name: 'total_clientes', label: 'Clientes', align: 'center', field: 'total_clientes', sortable: true },
  { name: 'total_telefones', label: 'Telefones', align: 'center', field: 'total_telefones', sortable: true },
  { name: 'data_cadastro', label: 'Data Cadastro', align: 'left', field: 'dtcadastro', sortable: true },
  { name: 'acoes', label: 'Acoes', align: 'center', field: '' },
]

const paginacaoTabela = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
  sortBy: null,
  descending: false,
})

watch(
  () => paginacao.value,
  (p) => {
    paginacaoTabela.value = {
      ...paginacaoTabela.value,
      page: p.page,
      rowsPerPage: p.limit,
      rowsNumber: p.total,
    }
  },
  { deep: true },
)

const pegaPercentual = (data: any) => {
  const row = data.row
  const trabalhados = parseInt(row.total_clientes_trabalhados || 0)
  const total = parseInt(row.total_clientes || 0)
  return total > 0 ? parseFloat(((trabalhados / total) * 100).toFixed(1)) : 0
}

const pegaPercentualTexto = (data: any) => {
  const row = data.row
  return `${parseInt(row.total_clientes_trabalhados || 0)}/${parseInt(row.total_clientes || 0)}`
}

const getCorPercentual = (p: number) => {
  if (p >= 75) return 'positive'
  if (p >= 40) return 'warning'
  return 'negative'
}

const formatarData = (data: string) => {
  if (!data) return '-'
  try { return format(new Date(data), 'dd/MM/yyyy') } catch { return data }
}

const debouncedFiltrar = useDebounceFn(() => filtrar(), 300)

const filtrar = async () => {
  paginacao.value.page = 1
  await buscarDados()
}

const limparFiltros = () => {
  filtros.campanha = ''
  filtros.ativa = true
  filtrar()
}

const buscarDados = async () => {
  const params: any = { page: paginacao.value.page, limit: paginacao.value.limit }
  if (filtros.campanha?.trim()) params.campanha = filtros.campanha.trim()
  if (filtros.ativa !== null) params.ativa = filtros.ativa
  await buscarCampanhas(params)
}

const onRequest = async (props: any) => {
  const { page, rowsPerPage } = props.pagination
  paginacaoTabela.value = { ...props.pagination, rowsNumber: paginacao.value.total }

  if (page !== paginacao.value.page) {
    paginacao.value.page = page
    await buscarDados()
  }
  if (rowsPerPage !== paginacao.value.limit) {
    paginacao.value.limit = rowsPerPage
    paginacao.value.page = 1
    await buscarDados()
  }
}

const handleCampanhaCriada = () => buscarDados()

const abrirModalExcluir = (campanha: any) => {
  modalExcluir.campanha = campanha
  modalExcluir.show = true
}

const confirmarExclusao = async () => {
  try {
    modalExcluir.loading = true
    const response = await atualizarStatusCampanha(modalExcluir.campanha.idcampanha, false)
    if (response.success) {
      toast.success('Campanha desativada com sucesso!')
      modalExcluir.show = false
      modalExcluir.campanha = null
      await buscarDados()
    } else {
      toast.error(response.message || 'Erro ao desativar campanha')
    }
  } catch (error: any) {
    toast.error(error?.message || 'Erro ao desativar campanha')
  } finally {
    modalExcluir.loading = false
  }
}

onMounted(() => buscarDados())
</script>

<style scoped>
.btn-create {
  height: 40px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0 20px;
  background: linear-gradient(135deg, #07AE86, #059669) !important;
  color: white;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.table-loading-overlay {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.campanhas-table.table-loading :deep(.q-table tbody) {
  opacity: 0.4;
  pointer-events: none;
}

.campanhas-table :deep(.q-table__top) { display: none; }
.campanhas-table :deep(thead th) {
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #374151;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}
.campanhas-table :deep(tbody td) { font-size: 0.875rem; color: #1f2937; padding: 10px 16px; }
.campanhas-table :deep(tbody tr:hover) { background: #f8fffe; }
.campanhas-table :deep(.q-table__bottom) { border-top: 1px solid #e0e0e0; background: #fafafa; }

/* Progress */
.progress-container { display: flex; flex-direction: column; gap: 6px; min-width: 140px; }
.progress-info { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; }
.progress-text { color: #5f6368; font-weight: 500; }
.progress-percentage { font-weight: 600; font-size: 0.85rem; }

/* Origens */
.origens-container { display: flex; flex-direction: column; gap: 4px; align-items: center; }
.origem-badge { font-size: 0.7rem; padding: 2px 6px; font-weight: 600; }

/* Status Indicator */
.status-indicator {
  width: 16px; height: 16px; border-radius: 50%; position: relative;
  display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.3s ease;
}
.status-indicator .status-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 100%; height: 100%; border-radius: 50%; filter: blur(4px); opacity: 0.6;
}
.status-active {
  background: linear-gradient(135deg, #10b981, #059669);
  animation: pulse-active 2s ease-in-out infinite;
}
.status-active .status-glow { background: radial-gradient(circle, #34d399, transparent 70%); }
.status-inactive { background: linear-gradient(135deg, #ef4444, #dc2626); }
.status-inactive .status-glow { background: radial-gradient(circle, #f87171, transparent 70%); }

@keyframes pulse-active {
  0%, 100% { box-shadow: 0 2px 8px rgba(16,185,129,0.3), 0 0 12px rgba(16,185,129,0.2); }
  50% { box-shadow: 0 2px 12px rgba(16,185,129,0.5), 0 0 20px rgba(16,185,129,0.4); }
}
</style>
