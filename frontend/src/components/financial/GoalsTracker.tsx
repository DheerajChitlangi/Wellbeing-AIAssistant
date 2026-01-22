import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { financialGoalApi, transactionApi } from '../../services/api';
import type { FinancialGoal, Transaction } from '../../types';

const GoalsTracker: React.FC = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [goalsRes, transactionsRes] = await Promise.all([
        financialGoalApi.getAll(),
        transactionApi.getAll(0, 1000),
      ]);
      setGoals(goalsRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlySavingsRate = () => {
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    const recentTransactions = transactions.filter(t => new Date(t.date) >= threeMonthsAgo);

    const income = recentTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = recentTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const months = 3;
    return (income - expenses) / months;
  };

  const predictGoalCompletion = (goal: FinancialGoal) => {
    const remaining = goal.target_amount - goal.current_amount;
    const monthlySavings = calculateMonthlySavingsRate();

    if (monthlySavings <= 0) {
      return {
        predictedDate: null,
        monthsRemaining: null,
        onTrack: false,
        message: 'No savings detected. Increase income or reduce expenses.',
      };
    }

    const monthsNeeded = Math.ceil(remaining / monthlySavings);
    const predictedDate = new Date();
    predictedDate.setMonth(predictedDate.getMonth() + monthsNeeded);

    const targetDate = new Date(goal.target_date);
    const onTrack = predictedDate <= targetDate;

    return {
      predictedDate,
      monthsRemaining: monthsNeeded,
      onTrack,
      message: onTrack
        ? `On track! Expected completion: ${predictedDate.toLocaleDateString()}`
        : `Behind schedule. May complete by ${predictedDate.toLocaleDateString()}`,
    };
  };

  const getProjectionData = (goal: FinancialGoal) => {
    const monthlySavings = calculateMonthlySavingsRate();
    const data = [];
    let amount = goal.current_amount;

    data.push({
      month: 'Now',
      amount: goal.current_amount,
      target: goal.target_amount,
    });

    for (let i = 1; i <= 12; i++) {
      amount += monthlySavings;
      data.push({
        month: `+${i}m`,
        amount: Math.min(amount, goal.target_amount),
        target: goal.target_amount,
      });

      if (amount >= goal.target_amount) break;
    }

    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const goalData = {
        title: formData.title,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount),
        target_date: formData.target_date,
        category: formData.category || undefined,
      };

      if (editingGoal?.id) {
        await financialGoalApi.update(editingGoal.id, goalData);
      } else {
        await financialGoalApi.create(goalData);
      }

      setFormData({ title: '', target_amount: '', current_amount: '', target_date: '', category: '' });
      setShowAddForm(false);
      setEditingGoal(null);
      fetchData();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      target_date: goal.target_date,
      category: goal.category || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await financialGoalApi.delete(id);
        setGoals(goals.filter(g => g.id !== id));
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const handleUpdateProgress = async (goal: FinancialGoal) => {
    const newAmount = prompt(
      `Update current amount for "${goal.title}"`,
      goal.current_amount.toString()
    );

    if (newAmount !== null) {
      try {
        await financialGoalApi.update(goal.id!, {
          current_amount: parseFloat(newAmount),
        });
        fetchData();
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', target_amount: '', current_amount: '', target_date: '', category: '' });
    setShowAddForm(false);
    setEditingGoal(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDaysRemaining = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading goals...</div>
      </div>
    );
  }

  const monthlySavings = calculateMonthlySavingsRate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Financial Goals Tracker</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Goal'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-800">Your Average Monthly Savings</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(monthlySavings)}</p>
          </div>
          <div className="text-xs text-blue-700">
            Based on last 3 months of transactions
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Goal Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Emergency Fund, Down Payment, Vacation"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="target_amount"
                    step="0.01"
                    min="0"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    className="pl-8 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10000.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="current_amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="current_amount"
                    step="0.01"
                    min="0"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                    className="pl-8 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="target_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  id="target_date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Savings, Investment"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
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
        {goals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No financial goals set. Click "Add Goal" to create your first goal.
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const remaining = goal.target_amount - goal.current_amount;
            const daysRemaining = getDaysRemaining(goal.target_date);
            const prediction = predictGoalCompletion(goal);
            const projectionData = getProjectionData(goal);

            return (
              <div key={goal.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{goal.title}</h3>
                      {goal.category && (
                        <span className="inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {goal.category}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateProgress(goal)}
                        className="text-green-600 hover:text-green-800 font-medium text-sm"
                      >
                        Update Progress
                      </button>
                      <button
                        onClick={() => handleEdit(goal)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id!)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Current</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(goal.current_amount)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Target</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(goal.target_amount)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Remaining</p>
                      <p className="text-xl font-bold text-orange-600">{formatCurrency(remaining)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress: {progress.toFixed(1)}%</span>
                      <span>
                        Target Date: {new Date(goal.target_date).toLocaleDateString()} ({daysRemaining} days)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 flex items-center justify-end pr-2 ${
                          progress >= 100
                            ? 'bg-green-500'
                            : progress >= 75
                            ? 'bg-blue-500'
                            : progress >= 50
                            ? 'bg-yellow-500'
                            : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      >
                        {progress >= 10 && (
                          <span className="text-xs font-bold text-white">{progress.toFixed(0)}%</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg mb-6 ${
                      prediction.onTrack ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl ${prediction.onTrack ? 'text-green-600' : 'text-orange-600'}`}>
                        {prediction.onTrack ? '✓' : '⚠'}
                      </span>
                      <div>
                        <p className={`font-semibold ${prediction.onTrack ? 'text-green-800' : 'text-orange-800'}`}>
                          {prediction.message}
                        </p>
                        {prediction.monthsRemaining !== null && (
                          <p className="text-sm text-gray-600 mt-1">
                            At your current savings rate ({formatCurrency(monthlySavings)}/month), you'll need{' '}
                            <span className="font-semibold">{prediction.monthsRemaining} months</span> to reach this goal.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Projection Timeline</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={projectionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          name="Projected Amount"
                        />
                        <Line
                          type="monotone"
                          dataKey="target"
                          stroke="#10b981"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          name="Target"
                        />
                      </LineChart>
                    </ResponsiveContainer>
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

export default GoalsTracker;
