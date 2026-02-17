import { authorizedGet, authorizedPost } from '~/services/api-core'

export interface ClientData {
  id: string
  name: string
  cpf: string
  ddd: string
  phones: string[]
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
}

export interface TabulationOption {
  id: number
  label: string
}

export interface Product {
  id: number
  name: string
  price: number
}

export interface UserMetrics {
  daily: {
    calls: number
    sales: number
    conversionRate: number
    averageTime: string
  }
  monthly: {
    calls: number
    sales: number
    conversionRate: number
    averageTime: string
  }
}

export const attendanceService = {
  async getClientData(idclicamptel: string): Promise<ClientData> {
    // TODO: Replace with actual API endpoint
    // responsive to: "Ao receber o ID, disparar imediatamente um request ao backend para buscar os dados do cliente"
    return await authorizedGet(`/clientes/${idclicamptel}`)
  },

  async getTabulationOptions(): Promise<TabulationOption[]> {
    // TODO: Replace with actual API endpoint
    // return await authorizedGet('/tabulacoes')
    return [
      { id: 1, label: 'Venda Realizada' },
      { id: 2, label: 'Agendamento' },
      { id: 3, label: 'Caixa Postal' },
      { id: 4, label: 'Não Atende' },
      { id: 5, label: 'Número Inválido' },
      { id: 6, label: 'Sem Interesse' }
    ]
  },

  async submitTabulation(payload: { idclicamptel: string; tabulationId: number; observation: string }) {
    // TODO: Replace with actual API endpoint
    // return await authorizedPost('/atendimentos/tabular', payload)
    return { success: true }
  },

  async getProducts(): Promise<Product[]> {
    // TODO: Replace with actual API endpoint
    // return await authorizedGet('/produtos')
    return [
      { id: 1, name: 'Internet 100MB', price: 99.90 },
      { id: 2, name: 'Internet 300MB', price: 129.90 },
      { id: 3, name: 'Internet 600MB', price: 159.90 },
      { id: 4, name: 'Combo TV + Net', price: 199.90 },
      { id: 5, name: 'Telefone Fixo', price: 29.90 }
    ]
  },

  async submitOrder(orderData: any) {
    // TODO: Replace with actual API endpoint
    // return await authorizedPost('/pedidos', orderData)
    return { orderId: Math.floor(Math.random() * 90000) + 10000 }
  },

  async getMetrics(): Promise<UserMetrics> {
    // TODO: Replace with actual API endpoint
    // return await authorizedGet('/atendimentos/metricas')

    // Mocking for immediate display
    return {
      daily: {
        calls: 12,
        sales: 3,
        conversionRate: 25,
        averageTime: '00:05:30'
      },
      monthly: {
        calls: 345,
        sales: 45,
        conversionRate: 13,
        averageTime: '00:06:15'
      }
    }
  }
}
