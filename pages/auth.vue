<script setup lang="ts">
import LoadingFullscreen from '~/components/ui/loading-fullscreen.vue'
import { useAuthStore } from '~/store/auth'
import { changePassword as apiChangePassword } from '~/services/auth.service'
import { toast } from 'vue-sonner'
import { ref } from 'vue'

const router = useRouter()
const auth = useAuthStore()

const isClient = ref(false)
const loading = ref(false)
const email = ref('')
const password = ref('')
const isPwd = ref(true)
const errors = ref<{ email?: string; password?: string; geral?: string }>({})

// Estado de troca de senha
const mustChangePassword = ref(false)
const novaSenha = ref('')
const confirmaSenha = ref('')
const isNewPwd = ref(true)
const isConfirmPwd = ref(true)
const changePwdErrors = ref<{ nova_senha?: string; confirma_senha?: string; geral?: string }>({})
const changePwdLoading = ref(false)

useHead({
  title: 'Login | ITS Ativo',
})

definePageMeta({
  layout: false,
  middleware: 'redirect-authenticated',
})

const handleLogin = async () => {
  errors.value = {}

  if (!email.value.trim()) {
    errors.value.email = 'Usuario e obrigatorio'
  }

  if (!password.value.trim()) {
    errors.value.password = 'Senha e obrigatoria'
  }

  if (Object.keys(errors.value).length) return

  loading.value = true

  try {
    await auth.login(email.value, password.value)

    const user = auth.user
    if (!user) throw new Error('Usuario nao carregado.')

    if (user.muda_senha) {
      mustChangePassword.value = true
      return
    }

    toast.success('Login realizado com sucesso!')
    const redirectPath = auth.getRedirectPath()
    return router.push(redirectPath)
  } catch (err: any) {
    console.error(err)
    errors.value.geral = err.message || 'Erro ao realizar login'
  } finally {
    loading.value = false
  }
}

const handleChangePassword = async () => {
  changePwdErrors.value = {}

  if (!novaSenha.value.trim()) {
    changePwdErrors.value.nova_senha = 'Nova senha e obrigatoria'
  }

  if (!confirmaSenha.value.trim()) {
    changePwdErrors.value.confirma_senha = 'Confirmacao e obrigatoria'
  }

  if (novaSenha.value.length < 4) {
    changePwdErrors.value.nova_senha = 'A senha deve ter no minimo 4 caracteres'
  }

  if (novaSenha.value !== confirmaSenha.value) {
    changePwdErrors.value.confirma_senha = 'As senhas nao coincidem'
  }

  if (novaSenha.value === email.value) {
    changePwdErrors.value.nova_senha = 'A nova senha nao pode ser igual ao usuario'
  }

  if (Object.keys(changePwdErrors.value).length) return

  changePwdLoading.value = true

  try {
    await apiChangePassword(password.value, novaSenha.value)
    toast.success('Senha alterada com sucesso!')

    mustChangePassword.value = false
    const redirectPath = auth.getRedirectPath()
    return router.push(redirectPath)
  } catch (err: any) {
    console.error(err)
    changePwdErrors.value.geral = err.response?.data?.mensagem || err.message || 'Erro ao alterar senha'
  } finally {
    changePwdLoading.value = false
  }
}

onMounted(async () => {
  isClient.value = true

  if (!auth.ready) {
    await auth.restoreSession()
  }

  if (auth.isAuthenticated) {
    const redirectPath = auth.getRedirectPath()
    navigateTo(redirectPath)
  }
})
</script>

<template>
  <ClientOnly>
    <LoadingFullscreen v-if="!auth.ready" />
    <div v-else class="login-page">
      <!-- Lado esquerdo - branding -->
      <div class="login-branding">
        <div class="branding-content">
          <div class="logo-wrapper">
            <img
              src="https://www.itscs.com.br/wp-content/themes/itscs/images/logotipo-itscs.png"
              alt="ITS Logo"
              class="branding-logo"
            />
          </div>
          <h1 class="branding-title">ITS Ativo</h1>
          <p class="branding-subtitle">Plataforma de gestao integrada</p>
          <div class="branding-decoration">
            <div class="decoration-circle c1"></div>
            <div class="decoration-circle c2"></div>
            <div class="decoration-circle c3"></div>
          </div>
        </div>
      </div>

      <!-- Lado direito - formulario -->
      <div class="login-form-side">
        <div class="login-form-container">
          <!-- Formulario de login -->
          <template v-if="!mustChangePassword">
            <div class="form-header">
              <h2 class="form-title">Bem-vindo</h2>
              <p class="form-subtitle">Entre com suas credenciais para acessar o sistema</p>
            </div>

            <div class="form-fields">
              <div class="field-group">
                <label class="field-label">Usuario</label>
                <q-input
                  v-model="email"
                  placeholder="Seu usuario"
                  outlined
                  dense
                  class="login-input"
                  color="deep-orange"
                  :error-message="errors.email"
                  :error="!!errors.email"
                  @keyup.enter="handleLogin"
                >
                  <template v-slot:prepend>
                    <q-icon name="person_outline" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="field-group">
                <label class="field-label">Senha</label>
                <q-input
                  v-model="password"
                  placeholder="Sua senha"
                  :type="isPwd ? 'password' : 'text'"
                  outlined
                  dense
                  class="login-input"
                  color="deep-orange"
                  :error-message="errors.password"
                  :error="!!errors.password"
                  @keyup.enter="handleLogin"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock_outline" color="grey-6" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      color="grey-6"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>
              </div>
            </div>

            <q-btn
              @click="handleLogin"
              label="Entrar"
              :loading="loading"
              no-caps
              unelevated
              class="login-btn"
            />

            <div class="login-error" v-if="errors.geral">
              <q-icon name="error_outline" size="18px" />
              <span>{{ errors.geral }}</span>
            </div>
          </template>

          <!-- Formulario de troca de senha -->
          <template v-else>
            <div class="form-header">
              <h2 class="form-title">Troque sua senha</h2>
              <p class="form-subtitle">Por seguranca, voce precisa definir uma nova senha antes de continuar</p>
            </div>

            <div class="form-fields">
              <div class="field-group">
                <label class="field-label">Nova senha</label>
                <q-input
                  v-model="novaSenha"
                  placeholder="Digite a nova senha"
                  :type="isNewPwd ? 'password' : 'text'"
                  outlined
                  dense
                  class="login-input"
                  color="deep-orange"
                  :error-message="changePwdErrors.nova_senha"
                  :error="!!changePwdErrors.nova_senha"
                  @keyup.enter="handleChangePassword"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock_outline" color="grey-6" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="isNewPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      color="grey-6"
                      @click="isNewPwd = !isNewPwd"
                    />
                  </template>
                </q-input>
              </div>

              <div class="field-group">
                <label class="field-label">Confirmar nova senha</label>
                <q-input
                  v-model="confirmaSenha"
                  placeholder="Repita a nova senha"
                  :type="isConfirmPwd ? 'password' : 'text'"
                  outlined
                  dense
                  class="login-input"
                  color="deep-orange"
                  :error-message="changePwdErrors.confirma_senha"
                  :error="!!changePwdErrors.confirma_senha"
                  @keyup.enter="handleChangePassword"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock_outline" color="grey-6" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="isConfirmPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      color="grey-6"
                      @click="isConfirmPwd = !isConfirmPwd"
                    />
                  </template>
                </q-input>
              </div>
            </div>

            <q-btn
              @click="handleChangePassword"
              label="Alterar senha"
              :loading="changePwdLoading"
              no-caps
              unelevated
              class="login-btn"
            />

            <div class="login-error" v-if="changePwdErrors.geral">
              <q-icon name="error_outline" size="18px" />
              <span>{{ changePwdErrors.geral }}</span>
            </div>
          </template>

          <div class="login-footer">
            <span>ITS Ativo &copy; {{ new Date().getFullYear() }}</span>
          </div>
        </div>
      </div>
    </div>
    <template #fallback>
      <LoadingFullscreen />
    </template>
  </ClientOnly>
</template>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

/* Branding side */
.login-branding {
  flex: 1;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.branding-content {
  text-align: center;
  z-index: 2;
  padding: 2rem;
}

.logo-wrapper {
  background: white;
  padding: 16px 28px;
  border-radius: 14px;
  margin: 0 auto 2rem;
  display: inline-block;
}

.branding-logo {
  width: 180px;
  height: auto;
}

.branding-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.branding-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

.branding-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
}

.c1 {
  width: 400px;
  height: 400px;
  background: #07AE86;
  top: -100px;
  right: -100px;
}

.c2 {
  width: 300px;
  height: 300px;
  background: #E05B3D;
  bottom: -80px;
  left: -60px;
}

.c3 {
  width: 200px;
  height: 200px;
  background: #07AE86;
  bottom: 20%;
  right: 10%;
}

/* Form side */
.login-form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.5rem;
}

.form-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.login-input :deep(.q-field__control) {
  border-radius: 10px;
}

.login-btn {
  width: 100%;
  height: 46px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #E05B3D, #c74a30) !important;
  color: white;
  transition: all 0.2s ease;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(224, 91, 61, 0.3);
}

.login-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  margin-top: 2.5rem;
  color: #9ca3af;
  font-size: 0.8rem;
}

/* Responsivo */
@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }

  .login-branding {
    flex: none;
    padding: 3rem 2rem;
    min-height: auto;
  }

  .branding-logo {
    width: 140px;
    margin-bottom: 1rem;
  }

  .branding-title {
    font-size: 1.75rem;
  }

  .branding-subtitle {
    font-size: 0.95rem;
  }

  .login-form-side {
    flex: 1;
  }
}
</style>
