import React, { useState, useEffect } from 'react';
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
} from 'recharts';
import { transactionApi, budgetApi } from '../../services/api';
import type { Transaction, Budget } from '../../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

const FinancialDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, budgetsRes] = await Promise.all([
        transactionApi.getAll(0, 1000),
        budgetApi.getAll(),
      ]);
      setTransactions(transactionsRes.data);
      setBudgets(budgetsRes.data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return transactions.filter(t => new Date(t.date) >= cutoffDate);
  };

  const getSpendingTrends = () => {
    const filtered = getFilteredTransactions();
    const grouped: { [key: string]: { income: number; expense: number; net: number } } = {};

    filtered.forEach(t => {
      const date = new Date(t.date);
      let key: string;

      if (timeRange === 'week') {
        key = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else if (timeRange === 'month') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      }

      if (!grouped[key]) {
        grouped[key] = { income: 0, expense: 0, net: 0 };
      }

      if (t.transaction_type === 'income') {
        grouped[key].income += t.amount;
      } else {
        grouped[key].expense += t.amount;
      }
      grouped[key].net = grouped[key].income - grouped[key].expense;
    });

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      ...data,
    }));
  };

  const getCategoryBreakdown = () => {
    const filtered = getFilteredTransactions();
    const expenses = filtered.filter(t => t.transaction_type === 'expense');
    const grouped: { [key: string]: number } = {};

    expenses.forEach(t => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getNetWorthProgression = () => {
    const sorted = [...transactions].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let netWorth = 0;
    const progression: { date: string; netWorth: number }[] = [];

    sorted.forEach(t => {
      if (t.transaction_type === 'income') {
        netWorth += t.amount;
      } else {
        netWorth -= t.amount;
      }
      progression.push({
        date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        netWorth,
      });
    });

    return progression.slice(-30);
  };

  const getBudgetVsActual = () => {
    const filtered = getFilteredTransactions();
    const expenses = filtered.filter(t => t.transaction_type === 'expense');
    const categorySpending: { [key: string]: number } = {};

    expenses.forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    return budgets.map(budget => ({
      category: budget.category,
      budget: budget.amount,
      actual: categorySpending[budget.category] || 0,
      remaining: Math.max(0, budget.amount - (categorySpending[budget.category] || 0)),
    }));
  };

  const getStats = () => {
    const filtered = getFilteredTransactions();
    const totalIncome = filtered
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filtered
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const stats = getStats();
  const spendingTrends = getSpendingTrends();
  const categoryBreakdown = getCategoryBreakdown();
  const netWorthProgression = getNetWorthProgression();
  const budgetVsActual = getBudgetVsActual();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Income</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpense)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Net Income</div>
          <div className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.netIncome)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Savings Rate</div>
          <div className="text-2xl font-bold text-blue-600">{stats.savingsRate.toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Spending Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" name="Income" strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Expenses" strokeWidth={2} />
              <Line type="monotone" dataKey="net" stroke="#3b82f6" name="Net" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Net Worth Progression</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={netWorthProgression}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Net Worth"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget vs Actual</h2>
          {budgetVsActual.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetVsActual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="budget" fill="#10b981" name="Budget" />
                <Bar dataKey="actual" fill="#ef4444" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No budgets set. Create budgets to see comparison.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
