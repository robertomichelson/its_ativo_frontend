<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import StandardPage from '~/components/ui/StandardPage.vue'
import type { Usuario, CreateUsuarioPayload, UpdateUsuarioPayload } from '~/services/users.service'
import { listUsuarios, createUsuario, updateUsuario, resetSenhaUsuario } from '~/services/users.service'

useHead({ title: 'Usuarios | ITS Ativo' })
definePageMeta({ middleware: ['auth', 'admin'] })

// State
const usuarios = ref<Usuario[]>([])
const loading = ref(false)
const search = ref('')
const showModal = ref(false)
const saving = ref(false)
const editingUser = ref<Usuario | null>(null)

// Form
const form = ref<CreateUsuarioPayload & { ativo: boolean }>({
  nome: '',
  email: '',
  cpf: '',
  telefone_celular: '',
  ramal: '',
  apelido: '',
  ativo: true,
})
const formErrors = ref<Record<string, string>>({})
const cpfDuplicado = ref(false)
const showResetDialog = ref(false)
const userToReset = ref<Usuario | null>(null)

function validarCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(digits[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10) resto = 0
  if (resto !== parseInt(digits[9])) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(digits[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10) resto = 0
  if (resto !== parseInt(digits[10])) return false

  return true
}

function checkCpf() {
  const cpf = form.value.cpf?.replace(/\D/g, '')
  if (!cpf || cpf.length < 11) {
    cpfDuplicado.value = false
    formErrors.value.cpf = ''
    return
  }

  if (!validarCpf(cpf)) {
    cpfDuplicado.value = true
    formErrors.value.cpf = 'CPF invalido'
    return
  }

  const existe = usuarios.value.some(
    (u) => u.cpf?.replace(/\D/g, '') === cpf && u.idusuario !== editingUser.value?.idusuario,
  )
  cpfDuplicado.value = existe
  formErrors.value.cpf = existe ? 'CPF ja cadastrado no sistema' : ''
}

// Table
const columns = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const, sortable: true },
  { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left' as const, sortable: true },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' as const, sortable: true },
  { name: 'telefone_celular', label: 'Celular', field: 'telefone_celular', align: 'left' as const },
  { name: 'ramal', label: 'Ramal', field: 'ramal', align: 'left' as const },
  { name: 'ativo', label: 'Status', field: 'ativo', align: 'center' as const },
  { name: 'acoes', label: 'Acoes', field: 'acoes', align: 'center' as const },
]

const filteredUsuarios = computed(() => {
  if (!search.value.trim()) return usuarios.value
  const s = search.value.toLowerCase()
  return usuarios.value.filter(
    (u) =>
      u.nome?.toLowerCase().includes(s) ||
      u.usuario?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s),
  )
})

const isEditing = computed(() => !!editingUser.value)
const modalTitle = computed(() => (isEditing.value ? 'Editar Usuario' : 'Novo Usuario'))

// Methods
async function fetchUsuarios() {
  loading.value = true
  try {
    const data = await listUsuarios()
    usuarios.value = (Array.isArray(data) ? data : []).map((u) => ({ ...u, ativo: !!u.ativo }))
  } catch (err: any) {
    toast.error('Erro ao carregar usuarios')
    console.error(err)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingUser.value = null
  form.value = {
    nome: '',
    email: '',
    cpf: '',
    telefone_celular: '',
    ramal: '',
    apelido: '',
    ativo: true,
  }
  formErrors.value = {}
  showModal.value = true
}

function openEdit(user: Usuario) {
  editingUser.value = user
  form.value = {
    nome: user.nome || '',
    email: user.email || '',
    cpf: user.cpf || '',
    telefone_celular: user.telefone_celular || '',
    ramal: user.ramal || '',
    apelido: user.apelido || '',
    ativo: !!user.ativo,
  }
  formErrors.value = {}
  showModal.value = true
}

function openResetPassword(user: Usuario) {
  userToReset.value = user
  showResetDialog.value = true
}

function validateForm(): boolean {
  formErrors.value = {}

  if (!form.value.nome.trim()) formErrors.value.nome = 'Nome e obrigatorio'
  if (!form.value.email.trim()) formErrors.value.email = 'E-mail e obrigatorio'
  if (cpfDuplicado.value) formErrors.value.cpf = 'CPF ja cadastrado no sistema'

  return Object.keys(formErrors.value).length === 0
}

async function handleSave() {
  if (!validateForm()) return

  saving.value = true
  try {
    if (isEditing.value && editingUser.value) {
      const payload: UpdateUsuarioPayload = {
        nome: form.value.nome,
        email: form.value.email,
        telefone_celular: form.value.telefone_celular || undefined,
        ramal: form.value.ramal || undefined,
        apelido: form.value.apelido || undefined,
        ativo: form.value.ativo,
      }
      await updateUsuario(editingUser.value.idusuario, payload)
      toast.success('Usuario atualizado com sucesso!')
    } else {
      const payload: CreateUsuarioPayload = {
        nome: form.value.nome,
        email: form.value.email,
        cpf: form.value.cpf || undefined,
        telefone_celular: form.value.telefone_celular || undefined,
        ramal: form.value.ramal || undefined,
        apelido: form.value.apelido || undefined,
        ativo: form.value.ativo,
      }
      await createUsuario(payload)
      toast.success('Usuario criado com sucesso!')
    }
    showModal.value = false
    await fetchUsuarios()
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Erro ao salvar usuario')
    console.error(err)
  } finally {
    saving.value = false
  }
}

async function handleResetPassword() {
  if (!userToReset.value) return
  saving.value = true
  try {
    await resetSenhaUsuario(userToReset.value.idusuario)
    toast.success(`Senha resetada para "${userToReset.value.usuario}"`)
    showResetDialog.value = false
    userToReset.value = null
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Erro ao resetar senha')
    console.error(err)
  } finally {
    saving.value = false
  }
}

onMounted(fetchUsuarios)
</script>

<template>
  <StandardPage title="Usuarios" subtitle="Gerencie os usuarios do sistema">
    <template #header>
      <div class="users-toolbar">
        <q-input
          v-model="search"
          placeholder="Buscar por nome, usuario ou e-mail..."
          outlined
          dense
          class="search-input"
          color="deep-orange"
        >
          <template #prepend>
            <q-icon name="search" color="grey-6" />
          </template>
          <template v-if="search" #append>
            <q-icon name="close" class="cursor-pointer" color="grey-6" @click="search = ''" />
          </template>
        </q-input>

        <q-btn
          label="Novo Usuario"
          icon="person_add"
          no-caps
          unelevated
          class="btn-create"
          @click="openCreate"
        />
      </div>
    </template>

    <!-- Tabela -->
    <q-table
      :rows="filteredUsuarios"
      :columns="columns"
      row-key="idusuario"
      flat
      bordered
      class="users-table"
      :pagination="{ rowsPerPage: 15 }"
      no-data-label="Nenhum usuario encontrado"
      :rows-per-page-options="[10, 15, 25, 50]"
      :loading="loading"
      :hide-bottom="loading"
    >
      <!-- Skeleton loading -->
      <template v-if="loading" #body>
        <tr v-for="n in 8" :key="n">
          <td v-for="col in columns" :key="col.name" class="q-td">
            <div v-if="col.name === 'nome'" class="user-name-cell">
              <q-skeleton type="QAvatar" size="32px" />
              <div>
                <q-skeleton type="text" :width="`${80 + n * 12}px`" />
              </div>
            </div>
            <q-skeleton v-else-if="col.name === 'ativo'" type="QBadge" width="50px" />
            <q-skeleton v-else-if="col.name === 'acoes'" type="QBtn" size="sm" />
            <q-skeleton v-else type="text" :width="`${60 + n * 10}px`" />
          </td>
        </tr>
      </template>

      <template #body-cell-nome="props">
        <q-td :props="props">
          <div class="user-name-cell">
            <q-avatar size="32px" color="grey-3" text-color="grey-7">
              <span style="font-size: 0.75rem; font-weight: 600">
                {{ props.row.nome?.charAt(0)?.toUpperCase() }}
              </span>
            </q-avatar>
            <div>
              <div class="user-name">{{ props.row.nome }}</div>
              <div v-if="props.row.apelido" class="user-nickname">{{ props.row.apelido }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template #body-cell-ativo="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.ativo ? 'green-2' : 'red-2'"
            :text-color="props.row.ativo ? 'green-9' : 'red-9'"
            class="status-badge"
          >
            {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-acoes="props">
        <q-td :props="props">
          <div class="actions-cell">
            <q-btn flat round dense size="sm" icon="edit" color="primary" @click="openEdit(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense size="sm" icon="lock_reset" color="orange-8" @click="openResetPassword(props.row)">
              <q-tooltip>Resetar Senha</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template #no-data>
        <div v-if="!loading" class="empty-state">
          <q-icon name="group" size="48px" color="grey-5" />
          <p class="empty-text">Nenhum usuario encontrado</p>
          <p class="empty-subtext">Clique em "Novo Usuario" para cadastrar</p>
        </div>
      </template>
    </q-table>

    <!-- Modal Criar/Editar -->
    <q-dialog v-model="showModal" persistent>
      <q-card class="modal-card">
        <q-card-section class="modal-header">
          <div class="modal-title">{{ modalTitle }}</div>
          <q-btn flat round dense icon="close" @click="showModal = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="modal-body">
          <div class="form-grid">
            <div class="field-group full">
              <label class="field-label">Nome *</label>
              <q-input
                v-model="form.nome"
                placeholder="Nome completo"
                outlined
                dense
                color="deep-orange"
                :error="!!formErrors.nome"
                :error-message="formErrors.nome"
              />
            </div>

            <div class="field-group">
              <label class="field-label">E-mail *</label>
              <q-input
                v-model="form.email"
                placeholder="email@exemplo.com"
                type="email"
                outlined
                dense
                color="deep-orange"
                :rules="[val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'E-mail invalido']"
                :error="!!formErrors.email"
                :error-message="formErrors.email"
              />
            </div>

            <div class="field-group">
              <label class="field-label">CPF</label>
              <q-input
                v-model="form.cpf"
                placeholder="000.000.000-00"
                mask="###.###.###-##"
                unmasked-value
                outlined
                dense
                color="deep-orange"
                :error="!!formErrors.cpf"
                :error-message="formErrors.cpf"
                @update:model-value="checkCpf"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Celular</label>
              <q-input
                v-model="form.telefone_celular"
                placeholder="(00) 00000-0000"
                mask="(##) #####-####"
                unmasked-value
                outlined
                dense
                color="deep-orange"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Ramal</label>
              <q-input
                v-model="form.ramal"
                placeholder="Ramal"
                mask="######"
                outlined
                dense
                color="deep-orange"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Apelido</label>
              <q-input
                v-model="form.apelido"
                placeholder="Apelido"
                outlined
                dense
                color="deep-orange"
              />
            </div>

            <div class="field-group full">
              <label class="field-label">Status</label>
              <q-toggle
                v-model="form.ativo"
                :label="form.ativo ? 'Ativo' : 'Inativo'"
                color="green"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cancelar" no-caps color="grey-7" @click="showModal = false" />
          <q-btn
            unelevated
            :label="isEditing ? 'Salvar' : 'Criar'"
            no-caps
            class="btn-save"
            :loading="saving"
            @click="handleSave"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Resetar Senha -->
    <q-dialog v-model="showResetDialog">
      <q-card class="reset-card">
        <q-card-section class="reset-header">
          <q-icon name="lock_reset" size="48px" color="orange-8" />
          <div class="reset-title">Resetar senha</div>
          <p class="reset-text">
            A senha do usuario <strong>{{ userToReset?.nome }}</strong> sera resetada para
            <strong>"{{ userToReset?.usuario }}"</strong>.
          </p>
        </q-card-section>

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cancelar" no-caps color="grey-7" @click="showResetDialog = false" />
          <q-btn
            unelevated
            label="Resetar"
            no-caps
            class="btn-reset"
            :loading="saving"
            @click="handleResetPassword"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </StandardPage>
</template>

<style scoped>
.users-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.search-input {
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.search-input :deep(.q-field__control) {
  border-radius: 10px;
}

.btn-create {
  height: 40px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0 20px;
  background: linear-gradient(135deg, #07AE86, #059669) !important;
  color: white;
  transition: all 0.2s ease;
}

.btn-create:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(7, 174, 134, 0.3);
}

/* Table */
.users-table {
  border-radius: 12px;
  overflow: hidden;
}

.users-table :deep(.q-table__top) {
  padding: 12px 16px;
}

.users-table :deep(thead th) {
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #374151;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.users-table :deep(tbody td) {
  font-size: 0.875rem;
  color: #1f2937;
  padding: 10px 16px;
}

.users-table :deep(tbody tr:hover) {
  background: #f8fffe;
}

.user-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1a1a2e;
}

.user-nickname {
  font-size: 0.75rem;
  color: #9ca3af;
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.02em;
}

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 0;
  width: 100%;
}

.empty-text {
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
}

.empty-subtext {
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 0;
}

/* Modal */
.modal-card {
  width: 600px;
  max-width: 95vw;
  border-radius: 16px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a2e;
}

.modal-body {
  padding: 20px;
  max-height: 65vh;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-grid .full {
  grid-column: 1 / -1;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-group :deep(.q-field__control) {
  border-radius: 10px;
}

.modal-actions {
  padding: 12px 20px;
}

.btn-save {
  border-radius: 10px;
  font-weight: 600;
  padding: 0 24px;
  background: linear-gradient(135deg, #E05B3D, #c74a30) !important;
  color: white;
}

/* Reset Dialog */
.reset-card {
  width: 420px;
  max-width: 90vw;
  border-radius: 16px;
}

.reset-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 24px 24px 12px;
}

.reset-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a2e;
}

.reset-text {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.btn-reset {
  border-radius: 10px;
  font-weight: 600;
  padding: 0 24px;
  background: linear-gradient(135deg, #e67e22, #d35400) !important;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .users-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
