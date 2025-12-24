import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Transaction, FraudAlert } from '../services/api'
import { transactionApi } from '../services/api'

interface TransactionContextType {
  transactions: Transaction[]
  fraudAlerts: FraudAlert[]
  stats: {
    totalTransactions: number
    totalAmount: number
    fraudCount: number
    highRiskCount: number
    avgRiskScore: number
    pendingAlerts: number
  }
  addTransaction: (transaction: Transaction) => void
  addFraudAlert: (alert: FraudAlert) => void
  refreshTransactions: () => Promise<void>
  refreshAlerts: () => Promise<void>
  refreshStats: () => Promise<void>
  updateAlertStatus: (alertId: number, status: string) => Promise<void>
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export const useTransactions = () => {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error('useTransactions must be used within TransactionProvider')
  }
  return context
}

interface TransactionProviderProps {
  children: ReactNode
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([])
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    fraudCount: 0,
    highRiskCount: 0,
    avgRiskScore: 0,
    pendingAlerts: 0,
  })
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    // Initialize WebSocket connection
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const wsUrl = API_URL.replace('http', 'ws').replace('https', 'wss') + '/ws'
    
    const newSocket = new WebSocket(wsUrl)

    newSocket.onopen = () => {
      console.log('WebSocket connected')
    }

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'fraud_alert') {
          refreshAlerts()
          refreshTransactions()
          refreshStats()
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    newSocket.onclose = () => {
      console.log('WebSocket disconnected')
    }

    setSocket(newSocket)

    // Initial data load
    refreshTransactions()
    refreshAlerts()
    refreshStats()

    // Set up polling as fallback (more frequent for stats)
    const statsInterval = setInterval(() => {
      refreshStats()
    }, 2000) // Refresh stats every 2 seconds

    const dataInterval = setInterval(() => {
      refreshTransactions()
      refreshAlerts()
    }, 5000) // Refresh data every 5 seconds

    return () => {
      newSocket.close()
      clearInterval(statsInterval)
      clearInterval(dataInterval)
    }
  }, [])

  const refreshTransactions = async () => {
    try {
      const data = await transactionApi.getTransactions(0, 500) // Get more transactions
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const refreshAlerts = async () => {
    try {
      const data = await transactionApi.getFraudAlerts(0, 500) // Get more alerts
      setFraudAlerts(data)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  const refreshStats = async () => {
    try {
      const data = await transactionApi.getTransactionStats()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev].slice(0, 500)) // Keep last 500 for display
    // Stats will be refreshed automatically
    refreshStats()
  }

  const addFraudAlert = (alert: FraudAlert) => {
    setFraudAlerts(prev => [alert, ...prev].slice(0, 500)) // Keep last 500 for display
    refreshStats()
  }

  const updateAlertStatus = async (alertId: number, status: string) => {
    try {
      await transactionApi.updateAlertStatus(alertId, status)
      await refreshAlerts()
      await refreshStats()
    } catch (error) {
      console.error('Error updating alert status:', error)
      throw error
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        fraudAlerts,
        stats,
        addTransaction,
        addFraudAlert,
        refreshTransactions,
        refreshAlerts,
        refreshStats,
        updateAlertStatus,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}
