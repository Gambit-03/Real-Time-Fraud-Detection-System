import { useState } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { format } from 'date-fns'

const FraudAlerts = () => {
  const { fraudAlerts, updateAlertStatus } = useTransactions()
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'false_positive'>('pending')

  const filteredAlerts = filter === 'all' 
    ? fraudAlerts 
    : fraudAlerts.filter(alert => alert.status === filter)

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'anomaly':
        return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' }
      case 'behavioral':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' }
      case 'pattern':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' }
      case 'reviewed':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' }
      case 'resolved':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }
      case 'false_positive':
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' }
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'anomaly':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'behavioral':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      case 'pattern':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      default:
        return null
    }
  }

  const handleStatusUpdate = async (alertId: number, newStatus: string) => {
    try {
      await updateAlertStatus(alertId, newStatus)
    } catch (error) {
      console.error('Error updating alert status:', error)
      alert('Failed to update alert status')
    }
  }

  const getRiskGaugeColor = (score: number) => {
    if (score >= 80) return 'bg-red-500'
    if (score >= 60) return 'bg-orange-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="banking-card">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Fraud Alert Management</h2>
            <p className="text-xs text-gray-500 mt-0.5">Review and manage security alerts</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="status-indicator online"></span>
            <span className="text-xs text-gray-500">Active Monitoring</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex space-x-2">
          {(['all', 'pending', 'reviewed', 'resolved', 'false_positive'] as const).map((status) => {
            const count = status === 'all' 
              ? fraudAlerts.length 
              : fraudAlerts.filter(a => a.status === status).length
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                  filter === status
                    ? 'bg-banking-blue text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                {count > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                    filter === status ? 'bg-white/20' : 'bg-gray-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-gray-200 max-h-[650px] overflow-y-auto banking-scrollbar">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No alerts found</p>
            <p className="text-sm text-gray-400 mt-1">All clear for this filter</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const typeColors = getAlertTypeColor(alert.alert_type)
            const statusColors = getStatusColor(alert.status)
            return (
              <div
                key={alert.id}
                className={`p-5 transition-colors ${
                  alert.status === 'pending' ? 'bg-yellow-50/50 border-l-4 border-yellow-500' : 'bg-white'
                } hover:bg-gray-50`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Alert Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`${typeColors.bg} ${typeColors.border} border rounded-lg p-2`}>
                        {getAlertIcon(alert.alert_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`${typeColors.bg} ${typeColors.text} ${typeColors.border} border rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide`}>
                            {alert.alert_type}
                          </span>
                          <span className={`${statusColors.bg} ${statusColors.text} ${statusColors.border} border rounded-full px-3 py-1 text-xs font-semibold`}>
                            {alert.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-gray-500 mt-1">
                          TXN: {alert.transaction_id}
                        </div>
                      </div>
                    </div>

                    {/* Alert Details */}
                    <div className="ml-14 space-y-2">
                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <span className="text-gray-500">User:</span>
                          <span className="ml-2 font-mono font-semibold text-gray-900">{alert.user_id}</span>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <div>
                          <span className="text-gray-500">Detected:</span>
                          <span className="ml-2 text-gray-700">{format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm:ss')}</span>
                        </div>
                      </div>

                      {/* Alert Description */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Alert Details</div>
                        <div className="text-sm text-gray-700 leading-relaxed">{alert.description}</div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Score Gauge */}
                  <div className="ml-6 flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-3">
                      <svg className="transform -rotate-90 w-24 h-24">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke={alert.risk_score >= 80 ? '#dc2626' : alert.risk_score >= 60 ? '#f97316' : '#eab308'}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(alert.risk_score / 100) * 251.2} 251.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getRiskGaugeColor(alert.risk_score).replace('bg-', 'text-')}`}>
                            {alert.risk_score.toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500">Risk</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {alert.status === 'pending' && (
                      <div className="flex flex-col space-y-2 w-full">
                        <button
                          onClick={() => handleStatusUpdate(alert.id, 'reviewed')}
                          className="banking-button-primary text-xs py-2"
                        >
                          Mark Reviewed
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(alert.id, 'false_positive')}
                          className="banking-button-secondary text-xs py-2"
                        >
                          False Positive
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(alert.id, 'resolved')}
                          className="banking-button bg-banking-success text-white hover:bg-green-600 text-xs py-2"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default FraudAlerts
