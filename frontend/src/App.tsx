import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import { TransactionProvider } from './context/TransactionContext'
import './App.css'

function App() {
  return (
    <TransactionProvider>
      <div className="min-h-screen bg-gray-50">
        <Dashboard />
      </div>
    </TransactionProvider>
  )
}

export default App

