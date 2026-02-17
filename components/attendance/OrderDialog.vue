<template>
  <q-dialog v-model="isOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card>
      <q-bar class="bg-primary text-white">
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Fechar</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <div class="text-h6">Novo Pedido</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-stepper v-model="step" vertical color="primary" animated>
          <q-step :name="1" title="Seleção de Produtos"icon="shopping_cart" :done="step > 1">
            <div class="q-gutter-md">
                <q-select
                    v-model="selectedProduct"
                    :options="products"
                    option-label="name"
                    option-value="id"
                    label="Produto"
                    filled
                />
                <q-input
                    v-model.number="quantity"
                    type="number"
                    label="Quantidade"
                    filled
                    min="1"
                />
                <q-input
                    v-model="itemObservation"
                    type="textarea"
                    label="Observações do Item"
                    filled
                    rows="2"
                />
            </div>
            <q-stepper-navigation>
              <q-btn @click="step = 2" color="primary" label="Continuar" :disable="!selectedProduct" />
            </q-stepper-navigation>
          </q-step>

          <q-step :name="2" title="Checkout" icon="payment" :done="step > 2">
            <div class="q-gutter-md" v-if="store.clientData">
                 <div class="text-subtitle1">Dados do Cliente</div>
                 <div>{{ store.clientData.name }} - CPF: {{ store.clientData.cpf }}</div>
                 
                 <q-separator />
                 
                 <div class="text-subtitle1">Endereço de Entrega</div>
                 <!-- Ideally pre-fill form or show address -->
                 <div v-if="store.clientData.address">
                     {{ store.clientData.address.street }}, {{ store.clientData.address.number }}
                     <br>{{ store.clientData.address.city }} - {{ store.clientData.address.state }}
                 </div>

                 <q-select
                    v-model="paymentMethod"
                    :options="['Dinheiro', 'Cartão de Crédito', 'PIX', 'Desconto em Fatura de Energia']"
                    label="Forma de Pagamento"
                    filled
                 />

                 <!-- Conditional Fields -->
                 <div v-if="paymentMethod === 'Cartão de Crédito'" class="q-gutter-sm q-mt-sm border q-pa-sm rounded-borders">
                     <div class="text-caption text-weight-bold">Dados do Cartão</div>
                     <q-input v-model="creditCard.number" label="Número do Cartão" dense outlined mask="#### #### #### ####" />
                     <q-input v-model="creditCard.name" label="Nome Impresso" dense outlined />
                     <div class="row q-col-gutter-sm">
                         <div class="col-6">
                            <q-input v-model="creditCard.expiry" label="Validade" dense outlined mask="##/##" />
                         </div>
                         <div class="col-6">
                            <q-input v-model="creditCard.cvv" label="CVV" dense outlined mask="###" />
                         </div>
                     </div>
                     <q-select 
                        v-model="creditCard.installments" 
                        :options="[1, 2, 3, 4, 5, 6, 10, 12]" 
                        label="Parcelas" 
                        dense 
                        outlined 
                     />
                 </div>

                 <div v-if="paymentMethod === 'Dinheiro'" class="q-mt-sm">
                     <q-input 
                        v-model.number="changeFor" 
                        label="Troco para (R$)" 
                        prefix="R$ " 
                        filled 
                        type="number"
                     />
                 </div>

                 <div v-if="paymentMethod === 'PIX'" class="q-mt-sm bg-blue-1 q-pa-md text-center rounded-borders">
                     <div class="text-subtitle2 text-primary">Pagamento via PIX</div>
                     <div class="text-caption">O QR Code será gerado ao finalizar o pedido.</div>
                 </div>

                 <div v-if="paymentMethod === 'Desconto em Fatura de Energia'" class="q-gutter-sm q-mt-sm border q-pa-sm rounded-borders">
                     <div class="text-caption text-weight-bold">Dados da Fatura</div>
                     <q-select 
                        v-model="energyBill.utility" 
                        :options="['Enel', 'Light', 'CPFL', 'Elektro']" 
                        label="Concessionária" 
                        dense 
                        outlined 
                     />
                     <q-input v-model="energyBill.installationCode" label="Código da Instalação / UC" dense outlined />
                     <q-input v-model="energyBill.holderCpf" label="CPF do Titular (opcional)" dense outlined mask="###.###.###-##" hint="Preencher apenas se for diferente do cliente" />
                 </div>
            </div>
            <q-stepper-navigation>
              <q-btn @click="submitOrder" color="primary" label="Finalizar Pedido" :loading="loading" />
              <q-btn flat @click="step = 1" color="primary" label="Voltar" class="q-ml-sm" />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { attendanceService, type Product } from '~/services/attendance.service'
import { useAttendanceStore } from '~/store/attendance'
import { useQuasar } from 'quasar'

const props = defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const store = useAttendanceStore()
const $q = useQuasar()

const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const step = ref(1)
const products = ref<Product[]>([])
const selectedProduct = ref<Product | null>(null)
const quantity = ref(1)
const itemObservation = ref('')
const paymentMethod = ref('')
const loading = ref(false)

// Payment Details State
const creditCard = ref({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: 1
})
const changeFor = ref<number | null>(null)
const energyBill = ref({
    utility: '',
    installationCode: '',
    holderCpf: ''
})

// Reset payment details when method changes
watch(paymentMethod, () => {
    creditCard.value = { number: '', name: '', expiry: '', cvv: '', installments: 1 }
    changeFor.value = null
    energyBill.value = { utility: '', installationCode: '', holderCpf: '' }
})

// Fetch products when dialog opens
watch(isOpen, async (val) => {
    if (val && products.value.length === 0) {
        try {
            products.value = await attendanceService.getProducts()
        } catch (e) {
             $q.notify({ type: 'negative', message: 'Erro ao carregar produtos' })
        }
    }
})

const submitOrder = async () => {
    if (!paymentMethod.value) {
         $q.notify({ type: 'warning', message: 'Selecione a forma de pagamento' })
         return
    }

    // Basic validation for payment details
    if (paymentMethod.value === 'Cartão de Crédito') {
        if (!creditCard.value.number || !creditCard.value.name || !creditCard.value.expiry || !creditCard.value.cvv) {
            $q.notify({ type: 'warning', message: 'Preencha os dados do cartão' })
            return
        }
    } else if (paymentMethod.value === 'Dinheiro') {
         // Optional: validate changeFor if needed, logical check usually done here
    } else if (paymentMethod.value === 'Desconto em Fatura de Energia') {
        if (!energyBill.value.utility || !energyBill.value.installationCode) {
            $q.notify({ type: 'warning', message: 'Preencha a Concessionária e o Código da Instalação' })
            return
        }
    }

    loading.value = true
    try {
        const orderData = {
            clientId: store.clientData?.id,
            items: [{
                productId: selectedProduct.value?.id,
                quantity: quantity.value,
                observation: itemObservation.value
            }],
            paymentMethod: paymentMethod.value,
            paymentDetails: {
                creditCard: paymentMethod.value === 'Cartão de Crédito' ? creditCard.value : undefined,
                changeFor: paymentMethod.value === 'Dinheiro' ? changeFor.value : undefined,
                energyBill: paymentMethod.value === 'Desconto em Fatura de Energia' ? energyBill.value : undefined
            }
        }
        
        const response = await attendanceService.submitOrder(orderData) 
        
        $q.dialog({
            title: 'Parabéns!',
            message: `Pedido realizado com sucesso! Número do pedido: ${response?.orderId || Math.floor(Math.random() * 10000)}`,
            ok: 'OK'
        }).onDismiss(() => {
            isOpen.value = false
            store.resetState()
            // Reset local state
            step.value = 1
            selectedProduct.value = null
            quantity.value = 1
            itemObservation.value = ''
            paymentMethod.value = ''
        })

    } catch (e) {
        $q.notify({ type: 'negative', message: 'Erro ao finalizar pedido' })
    } finally {
        loading.value = false
    }
}
</script>
