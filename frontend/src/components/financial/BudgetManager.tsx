import React, { useState, useEffect } from 'react';
import { budgetApi, transactionApi } from '../../services/api';
import type { Budget, Transaction } from '../../types';

const BudgetManager: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, transactionsRes] = await Promise.all([
        budgetApi.getAll(),
        transactionApi.getAll(0, 1000),
      ]);
      setBudgets(budgetsRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategorySpending = (category: string, period: Budget['period']) => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (period) {
      case 'weekly':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return transactions
      .filter(
        t =>
          t.category === category &&
          t.transaction_type === 'expense' &&
          new Date(t.date) >= cutoffDate
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const budgetData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
      };

      if (editingBudget?.id) {
        await budgetApi.update(editingBudget.id, budgetData);
      } else {
        await budgetApi.create(budgetData);
      }

      setFormData({ category: '', amount: '', period: 'monthly' });
      setShowAddForm(false);
      setEditingBudget(null);
      fetchData();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetApi.delete(id);
        setBudgets(budgets.filter(b => b.id !== id));
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ category: '', amount: '', period: 'monthly' });
    setShowAddForm(false);
    setEditingBudget(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 75) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    if (percentage < 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage < 75) return 'text-green-600';
    if (percentage < 90) return 'text-yellow-600';
    if (percentage < 100) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading budgets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Budget Manager</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Budget'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingBudget ? 'Edit Budget' : 'Add New Budget'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Food & Dining"
                  required
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="pl-8 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <select
                  id="period"
                  value={formData.period}
                  onChange={(e) =>
                    setFormData({ ...formData, period: e.target.value as Budget['period'] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {editingBudget ? 'Update Budget' : 'Create Budget'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {budgets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No budgets set. Click "Add Budget" to create your first budget.
            </p>
          </div>
        ) : (
          budgets.map((budget) => {
            const spent = getCategorySpending(budget.category, budget.period);
            const remaining = budget.amount - spent;
            const percentage = (spent / budget.amount) * 100;

            return (
              <div key={budget.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{budget.category}</h3>
                    <p className="text-sm text-gray-500 capitalize">{budget.period} Budget</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id!)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className={`font-semibold ${getProgressTextColor(percentage)}`}>
                      {formatCurrency(spent)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getProgressColor(percentage)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-600">Budget: </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Remaining: </span>
                      <span
                        className={`font-semibold ${
                          remaining >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(Math.abs(remaining))}
                        {remaining < 0 && ' over'}
                      </span>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <span className={`text-2xl font-bold ${getProgressTextColor(percentage)}`}>
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="text-gray-500 text-sm ml-2">of budget used</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetManager;
