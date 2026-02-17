<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section class="row items-center header-section">
        <div class="text-h6">Nova Lista</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="fecharModal" />
      </q-card-section>

      <q-separator />

      <q-card-section style="padding: 20px">
        <q-form @submit="handleSubmit" class="q-gutter-sm">
          <!-- Nome da Lista -->
          <div>
            <div class="text-subtitle2 q-mb-xs">Nome da Lista *</div>
            <q-input
              v-model="form.nomeLista"
              placeholder="Digite o nome da lista"
              outlined
              dense
              color="deep-orange"
              :rules="[(val: string) => !!val || 'Campo obrigatorio']"
            />
          </div>

          <!-- Selecionar Grupo de Campanha -->
          <div>
            <div class="text-subtitle2 q-mb-xs">Grupo de Campanha</div>
            <q-select
              v-model="form.idGrupoCampanha"
              :options="gruposFiltrados"
              placeholder="Selecione o grupo (opcional)"
              outlined
              dense
              color="deep-orange"
              emit-value
              map-options
              use-input
              fill-input
              hide-selected
              clearable
              input-debounce="300"
              @filter="filtrarGrupos"
              :loading="loadingGrupos"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">Nenhum grupo encontrado</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Data para Encerrar -->
          <div>
            <div class="text-subtitle2 q-mb-xs">Data de Encerramento *</div>
            <q-input
              v-model="form.dataEncerramento"
              placeholder="Selecione a data"
              outlined
              dense
              color="deep-orange"
              type="date"
              :rules="[(val: string) => !!val || 'Campo obrigatorio']"
            />
          </div>

          <!-- Upload de Arquivo -->
          <div class="q-mt-md">
            <q-file
              v-model="form.arquivo"
              label="Upload de Lista (CSV/Excel) - Opcional"
              outlined
              dense
              color="deep-orange"
              accept=".csv,.xlsx,.xls"
              @update:model-value="handleFileChange"
            >
              <template #prepend>
                <q-icon name="attach_file" />
              </template>
              <template #hint>
                Formatos aceitos: CSV, Excel (.xlsx, .xls)
              </template>
            </q-file>

            <div v-if="form.arquivo" class="q-mt-sm">
              <q-chip
                removable
                @remove="form.arquivo = null"
                color="deep-orange"
                text-color="white"
                icon="description"
              >
                {{ form.arquivo.name }}
              </q-chip>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" style="padding: 16px 20px">
        <q-btn flat label="Cancelar" color="grey" no-caps @click="fecharModal" />
        <q-btn
          unelevated
          color="deep-orange"
          label="Criar Campanha"
          no-caps
          @click="handleSubmit"
          :loading="loading"
          :disable="!isFormValid"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import * as XLSX from 'xlsx'
import { useGruposCampanhas } from '~/composables/useGruposCampanhas'
import { criarCampanha, type CriarCampanhaPayload } from '~/services/campanhas.service'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'campanha-criada'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { grupos, buscarGrupos } = useGruposCampanhas()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const form = ref({
  nomeLista: '',
  idGrupoCampanha: null as number | null,
  dataEncerramento: '',
  arquivo: null as File | null,
})

const loading = ref(false)
const loadingGrupos = ref(false)

const gruposOptions = computed(() =>
  grupos.value.map((g) => ({ label: g.grupo, value: g.id }))
)

const gruposFiltrados = ref<Array<{ label: string; value: number }>>([])

const isFormValid = computed(() => {
  return !!(form.value.nomeLista && form.value.dataEncerramento)
})

const filtrarGrupos = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (!val) {
      gruposFiltrados.value = gruposOptions.value
    } else {
      const needle = val.toLowerCase()
      gruposFiltrados.value = gruposOptions.value.filter(
        (g) => g.label.toLowerCase().includes(needle)
      )
    }
  })
}

// Extrair IDs ou CPFs do arquivo
const extrairDadosDoArquivo = async (file: File): Promise<{ tipo: 'ids' | 'cpf'; valores: number[] | string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

        const header = jsonData[0] as any[]
        const primeiraColuna = String(header[0] || '').toLowerCase().trim()
        const isCPF = primeiraColuna === 'cpf'

        if (isCPF) {
          const cpfs: string[] = []
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[]
            if (row && row[0]) {
              const cpfLimpo = String(row[0]).replace(/[^\d]/g, '')
              if (cpfLimpo && cpfLimpo.length === 11) cpfs.push(cpfLimpo)
            }
          }
          resolve({ tipo: 'cpf', valores: cpfs })
        } else {
          const ids: number[] = []
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[]
            if (row && row[0]) {
              const numeroLimpo = String(row[0]).replace(/[^\d]/g, '')
              if (numeroLimpo) {
                const id = parseInt(numeroLimpo, 10)
                if (!isNaN(id)) ids.push(id)
              }
            }
          }
          resolve({ tipo: 'ids', valores: ids })
        }
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsBinaryString(file)
  })
}

const handleFileChange = async (file: File | null) => {
  if (!file) return
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]
  if (!allowedTypes.includes(file.type)) {
    toast.warning('Formato de arquivo nao suportado. Use CSV ou Excel.')
    form.value.arquivo = null
    return
  }
  try {
    const resultado = await extrairDadosDoArquivo(file)
    const tipoTexto = resultado.tipo === 'cpf' ? 'CPFs' : 'clientes'
    toast.success(`${resultado.valores.length} ${tipoTexto} encontrados no arquivo`)
  } catch (error) {
    console.error('Erro ao processar arquivo:', error)
    toast.error('Erro ao processar arquivo')
    form.value.arquivo = null
  }
}

const fecharModal = () => {
  isOpen.value = false
  form.value = {
    nomeLista: '',
    idGrupoCampanha: null,
    dataEncerramento: '',
    arquivo: null,
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.warning('Preencha todos os campos obrigatorios')
    return
  }

  loading.value = true
  try {
    let clientesIds: number[] | undefined
    let clientesCpfs: string[] | undefined

    if (form.value.arquivo) {
      const resultado = await extrairDadosDoArquivo(form.value.arquivo)
      if (resultado.tipo === 'ids') {
        clientesIds = resultado.valores as number[]
      } else {
        clientesCpfs = resultado.valores as string[]
      }
    }

    // Pega operacao/orgao do grupo se selecionado
    const grupo = form.value.idGrupoCampanha
      ? grupos.value.find((g) => g.id === form.value.idGrupoCampanha)
      : null

    const payload: CriarCampanhaPayload = {
      campanha: form.value.nomeLista,
      tipo: 0,
      idoperacao: grupo?.idoperacao || 0,
      idorgao: grupo?.idorgao || 0,
      expiraem: form.value.dataEncerramento,
      ativo: true,
    }

    if (form.value.idGrupoCampanha) {
      payload.idgrupocampanha = form.value.idGrupoCampanha
    }

    if (clientesIds && clientesIds.length > 0) {
      payload.clientes = clientesIds
      payload.dtvalidade = form.value.dataEncerramento
    }

    if (clientesCpfs && clientesCpfs.length > 0) {
      payload.cpfs = clientesCpfs
      payload.dtvalidade = form.value.dataEncerramento
    }

    const response = await criarCampanha(payload)

    if (response.success) {
      toast.success(response.message || 'Campanha criada com sucesso!')
      emit('campanha-criada')
      fecharModal()
    } else {
      toast.error('Erro ao criar campanha')
    }
  } catch (error: any) {
    console.error('Erro ao criar campanha:', error)
    toast.error(error?.message || 'Erro ao criar campanha')
  } finally {
    loading.value = false
  }
}

// Carregar grupos quando o modal abrir
watch(isOpen, async (abriu) => {
  if (!abriu) return

  if (grupos.value.length === 0) {
    loadingGrupos.value = true
    await buscarGrupos(false, { simple: true }).finally(() => {
      loadingGrupos.value = false
      gruposFiltrados.value = gruposOptions.value
    })
  } else {
    gruposFiltrados.value = gruposOptions.value
  }
})
</script>

<style scoped>
.header-section {
  padding-bottom: 16px !important;
}
</style>
