<template>
  <div>
    <!-- Filtros -->
    <q-card class="q-mb-md" flat bordered style="border-radius: 12px">
      <q-card-section>
        <div class="text-subtitle2 text-weight-bold q-mb-sm" style="color: #374151">FILTROS</div>
        <div class="row items-end q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.fila"
              dense outlined
              label="Buscar por nome, fila, orgao ou operacao"
              debounce="500"
              :loading="loading"
              color="deep-orange"
              @update:model-value="onFiltroChange"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-2">
            <q-select
              v-model="filtros.ativo"
              :options="statusOptions"
              dense outlined
              label="Status"
              emit-value map-options clearable
              :loading="loading"
              color="deep-orange"
              @update:model-value="onFiltroChange"
            />
          </div>

          <div class="col-6 col-md-2">
            <q-input
              v-model="filtros.dataInicio"
              dense outlined
              label="Data inicio"
              type="date"
              color="deep-orange"
              @update:model-value="onFiltroChange"
            />
          </div>

          <div class="col-6 col-md-2">
            <q-input
              v-model="filtros.dataFim"
              dense outlined
              label="Data fim"
              type="date"
              color="deep-orange"
              @update:model-value="onFiltroChange"
            />
          </div>

          <div class="col-12 col-md-1">
            <q-btn unelevated color="grey-6" label="Limpar" @click="limparFiltros" :loading="loading" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Actions -->
    <div class="q-mb-md flex justify-between">
      <q-btn color="deep-orange" icon="refresh" label="Atualizar" outline no-caps @click="buscarGrupos(false, { simple: true })" />
    </div>

    <!-- Tabela -->
    <div class="table-container">
      <div v-if="loading && grupos.length > 0" class="table-loading-overlay">
        <q-spinner-dots size="3em" color="deep-orange" />
      </div>

      <q-table
        :rows="grupos"
        :columns="columns"
        v-model:pagination="paginacaoTabela"
        :rows-per-page-options="[10, 20, 50, 100]"
        rows-per-page-label="Registros por pagina:"
        @request="onRequest"
        row-key="id"
        class="grupos-table"
        :class="{ 'table-loading': loading && grupos.length > 0 }"
        flat bordered
      >
        <template #no-data>
          <div class="full-width row flex-center q-gutter-sm text-grey-6" style="min-height: 200px; padding: 2rem">
            <div v-if="loading" class="text-center">
              <q-spinner-dots size="3em" color="deep-orange" />
              <div class="text-subtitle1 q-mt-md">Carregando grupos...</div>
            </div>
            <div v-else class="text-center">
              <q-icon size="2em" name="inbox" />
              <div class="text-subtitle1 q-mt-sm">Nenhum grupo encontrado</div>
              <div class="text-body2">Tente ajustar os filtros</div>
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #body-cell-ativo="props">
          <q-td :props="props" class="text-center">
            <div
              class="status-indicator"
              :class="props.value ? 'status-active' : 'status-inactive'"
              :title="props.value ? 'Ativo' : 'Inativo'"
            >
              <div class="status-glow"></div>
            </div>
          </q-td>
        </template>

        <!-- Orgao -->
        <template #body-cell-orgao="props">
          <q-td :props="props">
            <q-chip v-if="props.row.nome_orgao" :label="props.row.nome_orgao" color="grey-3" text-color="grey-8" dense />
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>

        <!-- Operacao -->
        <template #body-cell-operacao="props">
          <q-td :props="props">
            <q-chip v-if="props.row.nome_operacao" :label="props.row.nome_operacao" color="deep-orange-1" text-color="deep-orange-9" dense />
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>

        <!-- Data Cadastro -->
        <template #body-cell-data_cadastro="props">
          <q-td :props="props">{{ formatarData(props.value) }}</q-td>
        </template>

        <!-- Acoes -->
        <template #body-cell-acoes="props">
          <q-td :props="props">
            <q-btn icon="delete" color="negative" size="sm" round flat @click.stop="abrirExcluir(props.row)">
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Modal Excluir -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="width: 420px; border-radius: 16px">
        <q-card-section class="text-center" style="padding: 24px">
          <q-icon name="warning" size="48px" color="orange-8" />
          <div class="text-h6 q-mt-sm">Excluir grupo</div>
          <p class="text-body2 text-grey-7 q-mt-sm">
            Tem certeza que deseja excluir o grupo <strong>"{{ grupoSelecionado?.grupo }}"</strong>?
          </p>
        </q-card-section>
        <q-card-actions align="right" style="padding: 12px 20px">
          <q-btn flat label="Cancelar" no-caps color="grey-7" @click="showDeleteDialog = false" />
          <q-btn unelevated label="Excluir" no-caps color="negative" :loading="loading" @click="confirmarExclusao" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useGruposCampanhas } from '~/composables/useGruposCampanhas'
import { format } from 'date-fns'

const {
  grupos,
  loading,
  filtros,
  paginacao,
  buscarGrupos,
  limparFiltros,
  mudarPagina,
  mudarTamanhoPagina,
  excluir,
  iniciarFiltragem,
  statusOptions,
} = useGruposCampanhas()

const showDeleteDialog = ref(false)
const grupoSelecionado = ref<any>(null)

onMounted(() => buscarGrupos(false, { simple: true }))

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, style: 'width: 30px' },
  { name: 'ativo', label: 'Status', field: 'ativo', align: 'center' as const, style: 'width: 30px' },
  { name: 'grupo', label: 'Nome do Grupo', field: 'grupo', align: 'left' as const, style: 'width: 250px' },
  { name: 'orgao', label: 'Orgao', field: 'nome_orgao', align: 'left' as const, style: 'width: 180px' },
  { name: 'operacao', label: 'Operacao', field: 'nome_operacao', align: 'left' as const, style: 'width: 200px' },
  { name: 'data_cadastro', label: 'Data Cadastro', field: 'data_cadastro', align: 'center' as const, style: 'width: 150px' },
  { name: 'acoes', label: 'Acoes', field: 'acoes', align: 'center' as const, style: 'width: 110px' },
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

const onRequest = async (props: any) => {
  const { page, rowsPerPage } = props.pagination
  paginacaoTabela.value = { ...props.pagination, rowsNumber: paginacao.value.total }
  if (page !== paginacao.value.page) mudarPagina(page)
  if (rowsPerPage !== paginacao.value.limit) mudarTamanhoPagina(rowsPerPage)
}

const onFiltroChange = () => iniciarFiltragem()

const formatarData = (data: string) => {
  if (!data) return '-'
  try { return format(new Date(data), 'dd/MM/yyyy HH:mm') } catch { return data }
}

const abrirExcluir = (grupo: any) => {
  grupoSelecionado.value = grupo
  showDeleteDialog.value = true
}

const confirmarExclusao = async () => {
  if (grupoSelecionado.value) {
    await excluir(grupoSelecionado.value)
    showDeleteDialog.value = false
    grupoSelecionado.value = null
  }
}
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.table-loading-overlay {
  position: absolute; top: 60px; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center; z-index: 10;
}

.grupos-table.table-loading :deep(.q-table tbody) { opacity: 0.4; pointer-events: none; }
.grupos-table :deep(.q-table__top) { display: none; }
.grupos-table :deep(thead th) {
  font-weight: 700; font-size: 0.75rem; text-transform: uppercase;
  letter-spacing: 0.05em; color: #374151; background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}
.grupos-table :deep(tbody td) { font-size: 0.875rem; color: #1f2937; padding: 12px 16px; }
.grupos-table :deep(tbody tr:hover) { background: #f8fffe; }
.grupos-table :deep(.q-table__bottom) { border-top: 1px solid #e0e0e0; background: #fafafa; }

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
