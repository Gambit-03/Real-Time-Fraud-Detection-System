import { useTransactions } from '../context/TransactionContext'
import { format } from 'date-fns'

const TransactionFeed = () => {
  const { transactions } = useTransactions()

  const getRiskColor = (riskScore: number | null) => {
    if (!riskScore) return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' }
    if (riskScore >= 70) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' }
    if (riskScore >= 50) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' }
    if (riskScore >= 30) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' }
    return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' }
  }

  const getRiskLabel = (riskScore: number | null) => {
    if (!riskScore) return 'Unknown'
    if (riskScore >= 70) return 'Critical'
    if (riskScore >= 50) return 'High'
    if (riskScore >= 30) return 'Medium'
    return 'Low'
  }

  const getRiskIcon = (riskScore: number | null) => {
    if (!riskScore || riskScore < 30) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    }
    if (riskScore < 70) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      'Retail': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      'Food & Dining': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      'Gas': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      'Electronics': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
    }
    return icons[category] || (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }

  return (
    <div className="banking-card">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Transaction Monitor</h2>
            <p className="text-xs text-gray-500 mt-0.5">Real-time transaction stream with fraud detection</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className="status-indicator online"></span>
            <span>Live</span>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">No transactions detected</p>
          <p className="text-sm text-gray-400 mt-1">Use the simulator to generate test transactions</p>
        </div>
      ) : (
        <div className="overflow-x-auto banking-scrollbar">
          <table className="banking-table">
            <thead>
              <tr>
                <th className="w-12"></th>
                <th>Transaction ID</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>User</th>
                <th>Amount</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const riskColors = getRiskColor(transaction.risk_score)
                return (
                  <tr
                    key={transaction.id}
                    className={`${transaction.is_fraud ? 'bg-red-50' : ''} ${
                      transaction.risk_score && transaction.risk_score >= 70 ? 'bg-orange-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.is_fraud ? 'bg-red-500' :
                        (transaction.risk_score || 0) >= 70 ? 'bg-orange-500' :
                        (transaction.risk_score || 0) >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                    </td>
                    <td>
                      <div className="font-mono text-xs text-gray-600">
                        {transaction.transaction_id.slice(0, 16)}...
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded bg-banking-blue/10 flex items-center justify-center text-banking-blue font-semibold text-xs">
                          {transaction.merchant.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{transaction.merchant}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-400">
                          {getCategoryIcon(transaction.category)}
                        </div>
                        <span className="text-sm text-gray-700">{transaction.category}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-gray-600">{transaction.user_id}</span>
                    </td>
                    <td>
                      <div className="font-semibold text-gray-900">
                        ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td>
                      {transaction.risk_score !== null ? (
                        <div className="flex items-center space-x-2">
                          <div className={`${riskColors.bg} ${riskColors.border} border rounded-full px-3 py-1 flex items-center space-x-1.5`}>
                            {getRiskIcon(transaction.risk_score)}
                            <span className={`${riskColors.text} text-xs font-semibold`}>
                              {transaction.risk_score.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{getRiskLabel(transaction.risk_score)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td>
                      {transaction.is_fraud ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                          FRAUD
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          CLEAR
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="text-xs text-gray-500 font-mono">
                        {format(new Date(transaction.timestamp), 'MMM dd, HH:mm:ss')}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {transactions.length > 0 && transactions.some(t => t.fraud_reason) && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Recent Fraud Indicators</div>
          <div className="space-y-2">
            {transactions
              .filter(t => t.fraud_reason)
              .slice(0, 3)
              .map((transaction) => (
                <div key={transaction.id} className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs font-mono text-gray-600 mb-1">{transaction.transaction_id}</div>
                      <div className="text-xs text-red-700">{transaction.fraud_reason}</div>
                    </div>
                    <div className="text-xs font-semibold text-red-600">
                      Risk: {transaction.risk_score?.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionFeed
