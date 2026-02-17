<template>
  <q-dialog v-model="isOpen" persistent transition-show="fade" transition-hide="fade">
    <div class="od">

      <!-- header -->
      <div class="od-header">
        <div>
          <p class="od-header__title">Novo Pedido</p>
          <p class="od-header__client" v-if="store.clientData">{{ store.clientData.name }}</p>
        </div>
        <button class="od-close" @click="isOpen = false">
          <q-icon name="close" size="18px" />
        </button>
      </div>

      <!-- steps indicator -->
      <div class="od-steps">
        <div class="od-step" :class="{ 'od-step--active': step === 1, 'od-step--done': step > 1 }">
          <span class="od-step__num">
            <q-icon v-if="step > 1" name="check" size="12px" />
            <template v-else>1</template>
          </span>
          <span class="od-step__label">Produto</span>
        </div>
        <span class="od-step__line" :class="{ 'od-step__line--done': step > 1 }" />
        <div class="od-step" :class="{ 'od-step--active': step === 2 }">
          <span class="od-step__num">2</span>
          <span class="od-step__label">Pagamento</span>
        </div>
      </div>

      <!-- ── step 1: produto ──────────────────────────────────── -->
      <div v-if="step === 1" class="od-body">
        <div class="od-field">
          <label class="od-label">Produto</label>
          <q-select
            v-model="selectedProduct"
            :options="products"
            option-label="name"
            option-value="id"
            placeholder="Selecione..."
            outlined dense
            :loading="products.length === 0"
          >
            <template v-if="selectedProduct" #append>
              <span class="od-price">R$ {{ selectedProduct.price.toFixed(2) }}</span>
            </template>
          </q-select>
        </div>

        <div class="od-field">
          <label class="od-label">Quantidade</label>
          <div class="od-qty">
            <button class="od-qty__btn" @click="quantity = Math.max(1, quantity - 1)">
              <q-icon name="remove" size="14px" />
            </button>
            <span class="od-qty__val">{{ quantity }}</span>
            <button class="od-qty__btn" @click="quantity++">
              <q-icon name="add" size="14px" />
            </button>
          </div>
        </div>

        <div class="od-field">
          <label class="od-label">Observações <span class="od-label--opt">(opcional)</span></label>
          <q-input
            v-model="itemObservation"
            type="textarea"
            placeholder="Alguma observação sobre este item..."
            outlined dense :rows="2"
          />
        </div>

        <!-- summary -->
        <div v-if="selectedProduct" class="od-summary">
          <span>{{ quantity }}× {{ selectedProduct.name }}</span>
          <span class="od-summary__total">
            R$ {{ (selectedProduct.price * quantity).toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- ── step 2: pagamento ────────────────────────────────── -->
      <div v-else class="od-body">

        <!-- client recap -->
        <div class="od-recap" v-if="store.clientData">
          <div class="od-recap__row">
            <q-icon name="person" size="14px" />
            {{ store.clientData.name }} · CPF {{ store.clientData.cpf }}
          </div>
          <div v-if="store.clientData.address" class="od-recap__row">
            <q-icon name="location_on" size="14px" />
            {{ store.clientData.address.street }}, {{ store.clientData.address.number }}
            · {{ store.clientData.address.city }}/{{ store.clientData.address.state }}
          </div>
        </div>

        <!-- payment method cards -->
        <div class="od-field">
          <label class="od-label">Forma de pagamento</label>
          <div class="od-methods">
            <button
              v-for="m in paymentMethods"
              :key="m.value"
              class="od-method"
              :class="{ 'od-method--active': paymentMethod === m.value }"
              @click="paymentMethod = m.value"
            >
              <q-icon :name="m.icon" size="20px" />
              <span>{{ m.label }}</span>
            </button>
          </div>
        </div>

        <!-- cartão -->
        <div v-if="paymentMethod === 'Cartão de Crédito'" class="od-payment-section">
          <div class="od-row">
            <div class="od-field od-field--grow">
              <label class="od-label">Número do cartão</label>
              <q-input v-model="creditCard.number" outlined dense mask="#### #### #### ####" placeholder="0000 0000 0000 0000" />
            </div>
          </div>
          <div class="od-field">
            <label class="od-label">Nome impresso</label>
            <q-input v-model="creditCard.name" outlined dense placeholder="Como está no cartão" />
          </div>
          <div class="od-row">
            <div class="od-field od-field--grow">
              <label class="od-label">Validade</label>
              <q-input v-model="creditCard.expiry" outlined dense mask="##/##" placeholder="MM/AA" />
            </div>
            <div class="od-field od-field--grow">
              <label class="od-label">CVV</label>
              <q-input v-model="creditCard.cvv" outlined dense mask="###" placeholder="000" />
            </div>
            <div class="od-field od-field--grow">
              <label class="od-label">Parcelas</label>
              <q-select v-model="creditCard.installments" :options="[1,2,3,4,5,6,10,12]" outlined dense />
            </div>
          </div>
        </div>

        <!-- dinheiro -->
        <div v-if="paymentMethod === 'Dinheiro'" class="od-payment-section">
          <div class="od-field">
            <label class="od-label">Troco para <span class="od-label--opt">(opcional)</span></label>
            <q-input v-model.number="changeFor" type="number" outlined dense prefix="R$" placeholder="0,00" />
          </div>
        </div>

        <!-- pix -->
        <div v-if="paymentMethod === 'PIX'" class="od-payment-section od-pix">
          <q-icon name="qr_code_2" size="32px" style="opacity:.4" />
          <p>O QR Code PIX será gerado ao finalizar o pedido.</p>
        </div>

        <!-- energia -->
        <div v-if="paymentMethod === 'Desconto em Fatura de Energia'" class="od-payment-section">
          <div class="od-field">
            <label class="od-label">Concessionária</label>
            <q-select v-model="energyBill.utility" :options="['Enel', 'Light', 'CPFL', 'Elektro']" outlined dense />
          </div>
          <div class="od-field">
            <label class="od-label">Código de instalação / UC</label>
            <q-input v-model="energyBill.installationCode" outlined dense />
          </div>
          <div class="od-field">
            <label class="od-label">CPF do titular <span class="od-label--opt">(se diferente do cliente)</span></label>
            <q-input v-model="energyBill.holderCpf" outlined dense mask="###.###.###-##" />
          </div>
        </div>
      </div>

      <!-- footer -->
      <div class="od-footer">
        <button v-if="step === 2" class="od-btn od-btn--ghost" @click="step = 1">
          <q-icon name="arrow_back" size="15px" /> Voltar
        </button>
        <span v-else />

        <button
          v-if="step === 1"
          class="od-btn od-btn--primary"
          :disabled="!selectedProduct"
          @click="step = 2"
        >
          Continuar <q-icon name="arrow_forward" size="15px" />
        </button>

        <button
          v-else
          class="od-btn od-btn--primary"
          :disabled="!paymentMethod || loading"
          @click="submitOrder"
        >
          <q-spinner v-if="loading" size="14px" color="white" />
          <template v-else>Finalizar pedido</template>
        </button>
      </div>

    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { attendanceService, type Product } from '~/services/attendance.service'
import { useAttendanceStore } from '~/store/attendance'
import { useQuasar } from 'quasar'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

const store = useAttendanceStore()
const $q = useQuasar()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const step = ref(1)
const products = ref<Product[]>([])
const selectedProduct = ref<Product | null>(null)
const quantity = ref(1)
const itemObservation = ref('')
const paymentMethod = ref('')
const loading = ref(false)

const creditCard = ref({ number: '', name: '', expiry: '', cvv: '', installments: 1 })
const changeFor = ref<number | null>(null)
const energyBill = ref({ utility: '', installationCode: '', holderCpf: '' })

const paymentMethods = [
  { value: 'Cartão de Crédito',             label: 'Cartão',  icon: 'credit_card' },
  { value: 'PIX',                            label: 'PIX',     icon: 'pix' },
  { value: 'Dinheiro',                       label: 'Dinheiro',icon: 'payments' },
  { value: 'Desconto em Fatura de Energia',  label: 'Energia', icon: 'bolt' },
]

watch(paymentMethod, () => {
  creditCard.value = { number: '', name: '', expiry: '', cvv: '', installments: 1 }
  changeFor.value = null
  energyBill.value = { utility: '', installationCode: '', holderCpf: '' }
})

watch(isOpen, async (val) => {
  if (val && products.value.length === 0) {
    try { products.value = await attendanceService.getProducts() }
    catch { $q.notify({ type: 'negative', message: 'Erro ao carregar produtos' }) }
  }
})

const submitOrder = async () => {
  if (!paymentMethod.value) return

  if (paymentMethod.value === 'Cartão de Crédito') {
    if (!creditCard.value.number || !creditCard.value.name || !creditCard.value.expiry || !creditCard.value.cvv) {
      $q.notify({ type: 'warning', message: 'Preencha os dados do cartão' })
      return
    }
  } else if (paymentMethod.value === 'Desconto em Fatura de Energia') {
    if (!energyBill.value.utility || !energyBill.value.installationCode) {
      $q.notify({ type: 'warning', message: 'Preencha a concessionária e o código de instalação' })
      return
    }
  }

  loading.value = true
  try {
    const response = await attendanceService.submitOrder({
      clientId: store.clientData?.id,
      items: [{ productId: selectedProduct.value?.id, quantity: quantity.value, observation: itemObservation.value }],
      paymentMethod: paymentMethod.value,
      paymentDetails: {
        creditCard: paymentMethod.value === 'Cartão de Crédito' ? creditCard.value : undefined,
        changeFor: paymentMethod.value === 'Dinheiro' ? changeFor.value : undefined,
        energyBill: paymentMethod.value === 'Desconto em Fatura de Energia' ? energyBill.value : undefined,
      },
    })

    $q.dialog({
      title: 'Pedido realizado!',
      message: `Pedido #${response?.orderId} confirmado com sucesso.`,
      ok: { label: 'OK', unelevated: true, color: 'secondary' },
    }).onDismiss(() => {
      isOpen.value = false
      store.resetState()
      step.value = 1
      selectedProduct.value = null
      quantity.value = 1
      itemObservation.value = ''
      paymentMethod.value = ''
    })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao finalizar pedido' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* dialog wrapper */
.od {
  width: 560px;
  max-width: 96vw;
  max-height: 92vh;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.12);
}

/* header */
.od-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.4rem 0;
}

.od-header__title {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin: 0;
  line-height: 1.2;
}

.od-header__client {
  font-size: 0.75rem;
  color: #999;
  margin: 2px 0 0;
}

.od-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #f4f5f7;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease;
}
.od-close:hover { background: #e8e9ec; color: #111; }

/* steps */
.od-steps {
  display: flex;
  align-items: center;
  padding: 1rem 1.4rem 0;
  gap: 0;
}

.od-step {
  display: flex;
  align-items: center;
  gap: 6px;
}

.od-step__num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e8e9ec;
  color: #999;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease, color 0.2s ease;
}

.od-step__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #bbb;
  transition: color 0.2s ease;
}

.od-step--active .od-step__num  { background: #E05B3D; color: #fff; }
.od-step--active .od-step__label { color: #111; }
.od-step--done .od-step__num    { background: #16a34a; color: #fff; }
.od-step--done .od-step__label  { color: #999; }

.od-step__line {
  flex: 1;
  height: 1px;
  background: #e8e9ec;
  margin: 0 0.6rem;
  transition: background 0.2s ease;
}
.od-step__line--done { background: #16a34a; }

/* body */
.od-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.1rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

/* field */
.od-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.od-field--grow { flex: 1; }

.od-row {
  display: flex;
  gap: 0.75rem;
}

.od-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: #555;
}
.od-label--opt {
  font-weight: 400;
  color: #aaa;
}

/* quantity */
.od-qty {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(0,0,0,0.16);
  border-radius: 8px;
  overflow: hidden;
  width: fit-content;
}
.od-qty__btn {
  width: 34px;
  height: 34px;
  border: none;
  background: #f4f5f7;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  transition: background 0.15s ease;
}
.od-qty__btn:hover { background: #e8e9ec; }
.od-qty__val {
  width: 40px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: #111;
  user-select: none;
}

/* price in select */
.od-price {
  font-size: 0.75rem;
  font-weight: 600;
  color: #16a34a;
}

/* summary bar */
.od-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f4f5f7;
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  font-size: 0.82rem;
  color: #555;
  margin-top: 0.25rem;
}
.od-summary__total {
  font-weight: 700;
  color: #111;
}

/* client recap */
.od-recap {
  background: #f8f9fb;
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.od-recap__row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #666;
}

/* payment methods */
.od-methods {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.od-method {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 0.75rem 0.5rem;
  border: 1.5px solid rgba(0,0,0,0.1);
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 600;
  color: #777;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}
.od-method:hover { border-color: rgba(0,0,0,0.2); color: #333; }
.od-method--active {
  border-color: #E05B3D;
  color: #E05B3D;
  background: rgba(224,91,61,.04);
}

/* payment details section */
.od-payment-section {
  background: #f8f9fb;
  border-radius: 10px;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.od-pix {
  align-items: center;
  text-align: center;
  color: #999;
  font-size: 0.8rem;
  padding: 1.25rem;
}
.od-pix p { margin: 0; }

/* footer */
.od-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.4rem 1.2rem;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.od-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 1.1rem;
  border-radius: 8px;
  border: none;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.od-btn:disabled { opacity: .35; cursor: default; }

.od-btn--ghost {
  background: transparent;
  color: #777;
}
.od-btn--ghost:hover { background: #f4f5f7; color: #333; }

.od-btn--primary {
  background: #E05B3D;
  color: #fff;
}
.od-btn--primary:hover:not(:disabled) { opacity: .88; }
</style>
