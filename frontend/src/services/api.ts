import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Transaction {
  id: number
  user_id: string
  transaction_id: string
  amount: number
  merchant: string
  category: string
  location: string | null
  latitude: number | null
  longitude: number | null
  timestamp: string
  is_fraud: boolean
  risk_score: number | null
  fraud_reason: string | null
  created_at: string
}

export interface FraudAlert {
  id: number
  transaction_id: string
  user_id: string
  risk_score: number
  alert_type: string
  description: string
  status: string
  created_at: string
  reviewed_at: string | null
}

export interface TransactionCreate {
  user_id: string
  transaction_id: string
  amount: number
  merchant: string
  category: string
  location?: string | null
  latitude?: number | null
  longitude?: number | null
  timestamp?: string | null
}

export const transactionApi = {
  createTransaction: async (transaction: TransactionCreate): Promise<Transaction> => {
    const response = await api.post<Transaction>('/api/transactions', transaction)
    return response.data
  },

  getTransactions: async (skip = 0, limit = 100, userId?: string): Promise<Transaction[]> => {
    const params: any = { skip, limit }
    if (userId) params.user_id = userId
    const response = await api.get<Transaction[]>('/api/transactions', { params })
    return response.data
  },

  getTransaction: async (transactionId: string): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/api/transactions/${transactionId}`)
    return response.data
  },

  getFraudAlerts: async (skip = 0, limit = 100, status?: string): Promise<FraudAlert[]> => {
    const params: any = { skip, limit }
    if (status) params.status = status
    const response = await api.get<FraudAlert[]>('/api/fraud-alerts', { params })
    return response.data
  },

  updateAlertStatus: async (alertId: number, status: string): Promise<void> => {
    await api.patch(`/api/fraud-alerts/${alertId}`, null, { params: { status } })
  },

  getTransactionStats: async (): Promise<{
    total_transactions: number
    total_amount: number
    fraud_count: number
    high_risk_count: number
    avg_risk_score: number
    pending_alerts: number
  }> => {
    const response = await api.get('/api/transactions/stats')
    return response.data
  },
}

