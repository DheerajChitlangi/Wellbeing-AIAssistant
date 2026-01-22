import React, { useState } from 'react';
import {
  FinancialDashboard,
  TransactionList,
  AddTransactionForm,
  BudgetManager,
  FinancialHealthScore,
  GoalsTracker,
} from '../components/financial';

type TabType = 'dashboard' | 'transactions' | 'budgets' | 'goals' | 'health';

const Financial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTransactionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'transactions' as TabType, label: 'Transactions', icon: '💳' },
    { id: 'budgets' as TabType, label: 'Budgets', icon: '💰' },
    { id: 'goals' as TabType, label: 'Goals', icon: '🎯' },
    { id: 'health' as TabType, label: 'Health Score', icon: '❤️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Financial Wellbeing</h1>
          </div>
          <div className="flex gap-1 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <FinancialDashboard />}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <AddTransactionForm onSuccess={handleTransactionSuccess} />
            <TransactionList refreshTrigger={refreshTrigger} />
          </div>
        )}

        {activeTab === 'budgets' && <BudgetManager />}

        {activeTab === 'goals' && <GoalsTracker />}

        {activeTab === 'health' && <FinancialHealthScore />}
      </div>
    </div>
  );
};

export default Financial;
