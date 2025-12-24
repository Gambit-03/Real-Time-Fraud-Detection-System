import { useState } from 'react'
import { transactionApi, TransactionCreate } from '../services/api'
import { useTransactions } from '../context/TransactionContext'

const TransactionSimulator = () => {
  const { addTransaction } = useTransactions()
  const [isSimulating, setIsSimulating] = useState(false)
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null)

  const merchants = [
    'Amazon', 'Walmart', 'Target', 'Starbucks', 'McDonald\'s',
    'Best Buy', 'Home Depot', 'CVS', 'Shell', 'Exxon',
    'Apple Store', 'Nike', 'Costco', 'Whole Foods', 'Trader Joe\'s'
  ]

  const categories = [
    'Retail', 'Food & Dining', 'Gas', 'Groceries', 'Electronics',
    'Entertainment', 'Travel', 'Utilities', 'Healthcare', 'Other'
  ]

  const generateTransaction = (): TransactionCreate => {
    const userId = `user_${Math.floor(Math.random() * 10) + 1}`
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Realistic transaction amounts - most are small, few are large
    // 85% normal ($10-$200), 10% medium ($200-$1000), 4% large ($1000-$5000), 1% very large ($5000+)
    const rand = Math.random()
    let amount: number
    if (rand < 0.85) {
      amount = Math.random() * 190 + 10  // $10-$200 (normal)
    } else if (rand < 0.95) {
      amount = Math.random() * 800 + 200  // $200-$1000 (medium)
    } else if (rand < 0.99) {
      amount = Math.random() * 4000 + 1000  // $1000-$5000 (large)
    } else {
      amount = Math.random() * 10000 + 5000  // $5000-$15000 (very large - rare)
    }
    
    const merchant = merchants[Math.floor(Math.random() * merchants.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    
    // Most transactions from normal location (90%), few from unusual (10%)
    const isUnusualLocation = Math.random() > 0.9
    const latitude = isUnusualLocation 
      ? 40.7128 + (Math.random() - 0.5) * 2  // Far from typical
      : 40.7128 + (Math.random() - 0.5) * 0.2  // NYC area
    const longitude = isUnusualLocation
      ? -74.0060 + (Math.random() - 0.5) * 2
      : -74.0060 + (Math.random() - 0.5) * 0.2

    return {
      user_id: userId,
      transaction_id: transactionId,
      amount: Math.round(amount * 100) / 100,
      merchant,
      category,
      location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    }
  }

  const sendTransaction = async () => {
    try {
      const transaction = generateTransaction()
      const result = await transactionApi.createTransaction(transaction)
      addTransaction(result)
    } catch (error) {
      console.error('Error sending transaction:', error)
    }
  }

  const startSimulation = () => {
    if (isSimulating) {
      // Stop simulation
      if (intervalId) {
        clearInterval(intervalId)
        setIntervalId(null)
      }
      setIsSimulating(false)
    } else {
      // Start simulation
      setIsSimulating(true)
      sendTransaction() // Send immediately
      const id = setInterval(() => {
        sendTransaction()
      }, 2000) // Send every 2 seconds
      setIntervalId(id)
    }
  }

  const sendSingleTransaction = () => {
    sendTransaction()
  }

  return (
    <div className="banking-card">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-banking-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-900">Transaction Simulator</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">Generate test transactions for system validation</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-banking-blue p-4 rounded-r-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-banking-blue mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">System Testing Mode</p>
              <p className="text-xs leading-relaxed">
                The simulator generates realistic transaction data to test fraud detection algorithms. 
                Each transaction is analyzed in real-time using ML models and behavioral analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-3">
          <button
            onClick={startSimulation}
            className={`w-full banking-button font-semibold ${
              isSimulating
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'banking-button-primary'
            }`}
          >
            <span className="flex items-center justify-center space-x-2">
              {isSimulating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Stop Simulation</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Start Auto Simulation</span>
                </>
              )}
            </span>
          </button>

          <button
            onClick={sendSingleTransaction}
            disabled={isSimulating}
            className="w-full banking-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Send Single Transaction</span>
            </span>
          </button>
        </div>

        {/* Status Indicator */}
        {isSimulating && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="status-indicator online bg-yellow-500"></span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-yellow-800">Simulation Active</p>
                <p className="text-xs text-yellow-700">Generating transactions every 2 seconds</p>
              </div>
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Simulation Parameters</div>
          <div className="space-y-2">
            {[
              { icon: '💰', text: 'Amount Range: $10 - $15,000' },
              { icon: '🏪', text: 'Multiple merchants & categories' },
              { icon: '📍', text: 'Location-based pattern analysis' },
              { icon: '⚠️', text: '10% chance of fraud triggers' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600">
                <span className="text-sm">{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionSimulator
