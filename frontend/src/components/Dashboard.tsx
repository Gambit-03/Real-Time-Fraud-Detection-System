import { useState } from 'react'
import TransactionFeed from './TransactionFeed'
import FraudAlerts from './FraudAlerts'
import Analytics from './Analytics'
import TransactionSimulator from './TransactionSimulator'
import { useTransactions } from '../context/TransactionContext'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'alerts' | 'analytics'>('transactions')
  const { stats } = useTransactions()

  // Ensure stats has default values to prevent undefined errors
  const safeStats = {
    total_transactions: stats?.total_transactions ?? 0,
    total_amount: stats?.total_amount ?? 0,
    fraud_count: stats?.fraud_count ?? 0,
    high_risk_count: stats?.high_risk_count ?? 0,
    avg_risk_score: stats?.avg_risk_score ?? 0,
    pending_alerts: stats?.pending_alerts ?? 0,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Banking Header */}
      <header className="bg-banking-navy text-white shadow-banking-lg">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-banking-blue rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Fraud Detection & Monitoring</h1>
                <p className="text-sm text-gray-300 font-light">Real-Time Transaction Security System</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="status-indicator online"></span>
                <span className="text-sm font-medium">System Operational</span>
              </div>
              <div className="h-6 w-px bg-gray-600"></div>
              <div className="text-sm">
                <span className="text-gray-400">Last Update:</span>
                <span className="ml-2 font-mono text-gray-200">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Key Metrics Dashboard */}
      <div className="max-w-[1920px] mx-auto px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="banking-card p-5 border-l-4 border-banking-blue">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Transactions</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{safeStats.total_transactions.toLocaleString()}</div>
            <div className="mt-2 text-xs text-gray-500">Active monitoring</div>
          </div>

          <div className="banking-card p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Critical Alerts</span>
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-red-600">{safeStats.pending_alerts}</div>
            <div className="mt-2 text-xs text-gray-500">Requires immediate attention</div>
          </div>

          <div className="banking-card p-5 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">High Risk</span>
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-orange-600">{safeStats.high_risk_count}</div>
            <div className="mt-2 text-xs text-gray-500">Risk score ≥ 70</div>
          </div>

          <div className="banking-card p-5 border-l-4 border-banking-success">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Volume</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">${(safeStats.total_amount / 1000).toFixed(1)}K</div>
            <div className="mt-2 text-xs text-gray-500">${safeStats.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total</div>
          </div>

          <div className="banking-card p-5 border-l-4 border-banking-blue">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Risk Score</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{safeStats.avg_risk_score.toFixed(1)}</div>
            <div className="mt-2 text-xs text-gray-500">Out of 100</div>
          </div>
        </div>

        {/* Navigation Tabs - Banking Style */}
        <div className="banking-card mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'transactions'
                    ? 'border-banking-blue text-banking-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Transaction Monitor</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors relative ${
                  activeTab === 'alerts'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Fraud Alerts</span>
                  {safeStats.pending_alerts > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                      {safeStats.pending_alerts}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-banking-blue text-banking-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Analytics & Reports</span>
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`${activeTab === 'analytics' ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
            {activeTab === 'transactions' && <TransactionFeed />}
            {activeTab === 'alerts' && <FraudAlerts />}
            {activeTab === 'analytics' && <Analytics />}
          </div>
          {activeTab !== 'analytics' && (
            <div className="lg:col-span-4">
              <TransactionSimulator />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
