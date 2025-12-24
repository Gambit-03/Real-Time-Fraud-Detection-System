import { useTransactions } from '../context/TransactionContext'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const Analytics = () => {
  const { transactions, fraudAlerts } = useTransactions()

  // Prepare data for charts
  const riskDistribution = [
    { name: 'Very Low (0-30)', value: transactions.filter(t => (t.risk_score || 0) < 30).length, color: '#10b981' },
    { name: 'Low (30-50)', value: transactions.filter(t => (t.risk_score || 0) >= 30 && (t.risk_score || 0) < 50).length, color: '#f59e0b' },
    { name: 'Medium (50-70)', value: transactions.filter(t => (t.risk_score || 0) >= 50 && (t.risk_score || 0) < 70).length, color: '#ef4444' },
    { name: 'High (70+)', value: transactions.filter(t => (t.risk_score || 0) >= 70).length, color: '#dc2626' },
  ].filter(item => item.value > 0)

  const categoryData = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryChartData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // Time series data (last 24 hours)
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date()
    hour.setHours(hour.getHours() - (23 - i))
    return {
      hour: hour.getHours(),
      hourLabel: hour.getHours() + ':00',
      transactions: transactions.filter(t => {
        const tDate = new Date(t.timestamp)
        return tDate.toISOString().slice(0, 13) === hour.toISOString().slice(0, 13)
      }).length,
      fraud: transactions.filter(t => {
        const tDate = new Date(t.timestamp)
        return tDate.toISOString().slice(0, 13) === hour.toISOString().slice(0, 13) && t.is_fraud
      }).length,
    }
  })

  const alertTypeData = fraudAlerts.reduce((acc, a) => {
    acc[a.alert_type] = (acc[a.alert_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const alertTypeChartData = Object.entries(alertTypeData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  // Amount distribution
  const amountRanges = [
    { range: '$0-100', min: 0, max: 100 },
    { range: '$100-500', min: 100, max: 500 },
    { range: '$500-1K', min: 500, max: 1000 },
    { range: '$1K-5K', min: 1000, max: 5000 },
    { range: '$5K+', min: 5000, max: Infinity },
  ]

  const amountDistribution = amountRanges.map(range => ({
    range: range.range,
    count: transactions.filter(t => t.amount >= range.min && t.amount < range.max).length,
  }))

  return (
    <div className="space-y-6">
      <div className="banking-card">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-xs text-gray-500 mt-0.5">Comprehensive fraud detection metrics and insights</p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="status-indicator online"></span>
              <span>Live Data</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution Pie Chart */}
            <div className="banking-card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Risk Score Distribution</h3>
              {riskDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  <p>No data available</p>
                </div>
              )}
            </div>

            {/* Alert Types Bar Chart */}
            <div className="banking-card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Alert Types Distribution</h3>
              {alertTypeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={alertTypeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }} 
                    />
                    <Bar dataKey="value" fill="#0066cc" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  <p>No alerts generated yet</p>
                </div>
              )}
            </div>

            {/* Transactions by Category */}
            <div className="banking-card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Transactions by Category</h3>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" fontSize={12} />
                    <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }} 
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  <p>No transactions yet</p>
                </div>
              )}
            </div>

            {/* Hourly Transaction Trend */}
            <div className="banking-card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">24-Hour Transaction Trend</h3>
              {hourlyData.some(h => h.transactions > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hourLabel" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="transactions" 
                      stroke="#0066cc" 
                      strokeWidth={2}
                      name="Transactions"
                      dot={{ fill: '#0066cc', r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="fraud" 
                      stroke="#dc3545" 
                      strokeWidth={2}
                      name="Fraud Detected"
                      dot={{ fill: '#dc3545', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  <p>No transaction data available</p>
                </div>
              )}
            </div>

            {/* Amount Distribution */}
            <div className="banking-card p-5 lg:col-span-2">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Transaction Amount Distribution</h3>
              {amountDistribution.some(a => a.count > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={amountDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="range" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }} 
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  <p>No transaction data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
