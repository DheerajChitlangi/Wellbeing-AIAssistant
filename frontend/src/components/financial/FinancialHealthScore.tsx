import React, { useState, useEffect } from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { transactionApi, budgetApi, financialGoalApi } from '../../services/api';
import type { Transaction, Budget, FinancialGoal } from '../../types';

interface HealthMetric {
  name: string;
  score: number;
  maxScore: number;
  color: string;
  details: string;
}

const FinancialHealthScore: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, budgetsRes, goalsRes] = await Promise.all([
        transactionApi.getAll(0, 1000),
        budgetApi.getAll(),
        financialGoalApi.getAll(),
      ]);
      setTransactions(transactionsRes.data);
      setBudgets(budgetsRes.data);
      setGoals(goalsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSavingsRateScore = (): HealthMetric => {
    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 1);

    const recentTransactions = transactions.filter(t => new Date(t.date) >= monthAgo);
    const income = recentTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = recentTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    let score = 0;

    if (savingsRate >= 20) score = 30;
    else if (savingsRate >= 15) score = 25;
    else if (savingsRate >= 10) score = 20;
    else if (savingsRate >= 5) score = 15;
    else if (savingsRate >= 0) score = 10;

    return {
      name: 'Savings Rate',
      score,
      maxScore: 30,
      color: '#10b981',
      details: `${savingsRate.toFixed(1)}% savings rate. Target: 20%+`,
    };
  };

  const calculateBudgetAdherenceScore = (): HealthMetric => {
    if (budgets.length === 0) {
      return {
        name: 'Budget Adherence',
        score: 0,
        maxScore: 25,
        color: '#f59e0b',
        details: 'No budgets set',
      };
    }

    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 1);

    let totalAdherence = 0;

    budgets.forEach(budget => {
      const spent = transactions
        .filter(
          t =>
            t.category === budget.category &&
            t.transaction_type === 'expense' &&
            new Date(t.date) >= monthAgo
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const adherence = Math.max(0, 100 - (spent / budget.amount) * 100);
      totalAdherence += adherence;
    });

    const avgAdherence = totalAdherence / budgets.length;
    const score = (avgAdherence / 100) * 25;

    return {
      name: 'Budget Adherence',
      score: Math.round(score),
      maxScore: 25,
      color: '#f59e0b',
      details: `${avgAdherence.toFixed(1)}% average budget adherence`,
    };
  };

  const calculateGoalProgressScore = (): HealthMetric => {
    if (goals.length === 0) {
      return {
        name: 'Goal Progress',
        score: 0,
        maxScore: 20,
        color: '#8b5cf6',
        details: 'No financial goals set',
      };
    }

    const totalProgress = goals.reduce((sum, goal) => {
      const progress = (goal.current_amount / goal.target_amount) * 100;
      return sum + Math.min(progress, 100);
    }, 0);

    const avgProgress = totalProgress / goals.length;
    const score = (avgProgress / 100) * 20;

    return {
      name: 'Goal Progress',
      score: Math.round(score),
      maxScore: 20,
      color: '#8b5cf6',
      details: `${avgProgress.toFixed(1)}% average goal completion`,
    };
  };

  const calculateSpendingDiversityScore = (): HealthMetric => {
    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 1);

    const recentExpenses = transactions.filter(
      t => t.transaction_type === 'expense' && new Date(t.date) >= monthAgo
    );

    if (recentExpenses.length === 0) {
      return {
        name: 'Spending Balance',
        score: 0,
        maxScore: 15,
        color: '#3b82f6',
        details: 'No recent spending data',
      };
    }

    const categorySpending: { [key: string]: number } = {};
    recentExpenses.forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    const categories = Object.keys(categorySpending);
    const totalSpent = Object.values(categorySpending).reduce((sum, amt) => sum + amt, 0);
    const avgSpending = totalSpent / categories.length;

    const variance = Object.values(categorySpending).reduce((sum, amt) => {
      return sum + Math.pow(amt - avgSpending, 2);
    }, 0) / categories.length;

    const coefficientOfVariation = Math.sqrt(variance) / avgSpending;
    const balanceScore = Math.max(0, 15 - coefficientOfVariation * 5);

    return {
      name: 'Spending Balance',
      score: Math.round(Math.min(balanceScore, 15)),
      maxScore: 15,
      color: '#3b82f6',
      details: `Spending across ${categories.length} categories`,
    };
  };

  const calculateConsistencyScore = (): HealthMetric => {
    if (transactions.length < 7) {
      return {
        name: 'Tracking Consistency',
        score: 0,
        maxScore: 10,
        color: '#ec4899',
        details: 'Not enough data',
      };
    }

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const recentDays = new Set(
      transactions
        .filter(t => new Date(t.date) >= sevenDaysAgo)
        .map(t => new Date(t.date).toDateString())
    );

    const score = (recentDays.size / 7) * 10;

    return {
      name: 'Tracking Consistency',
      score: Math.round(score),
      maxScore: 10,
      color: '#ec4899',
      details: `Tracked ${recentDays.size} of last 7 days`,
    };
  };

  const metrics = [
    calculateSavingsRateScore(),
    calculateBudgetAdherenceScore(),
    calculateGoalProgressScore(),
    calculateSpendingDiversityScore(),
    calculateConsistencyScore(),
  ];

  const totalScore = metrics.reduce((sum, m) => sum + m.score, 0);
  const maxTotalScore = metrics.reduce((sum, m) => sum + m.maxScore, 0);
  const overallPercentage = (totalScore / maxTotalScore) * 100;

  const getScoreGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const scoreGrade = getScoreGrade(overallPercentage);

  const chartData = [
    {
      name: 'Overall Health',
      score: overallPercentage,
      fill: overallPercentage >= 70 ? '#10b981' : overallPercentage >= 50 ? '#f59e0b' : '#ef4444',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Calculating health score...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Financial Health Score</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Overall Score</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              barSize={30}
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                minAngle={15}
                background
                clockWise
                dataKey="score"
                cornerRadius={10}
              />
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-5xl font-bold"
                fill={chartData[0].fill}
              >
                {overallPercentage.toFixed(0)}
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-lg"
                fill="#666"
              >
                out of 100
              </text>
            </RadialBarChart>
          </ResponsiveContainer>

          <div className={`text-center p-4 rounded-lg ${scoreGrade.bg}`}>
            <div className={`text-4xl font-bold ${scoreGrade.color}`}>{scoreGrade.grade}</div>
            <div className="text-sm text-gray-600 mt-2">
              {overallPercentage >= 80 && 'Excellent financial health!'}
              {overallPercentage >= 60 && overallPercentage < 80 && 'Good financial health'}
              {overallPercentage >= 40 && overallPercentage < 60 && 'Fair financial health'}
              {overallPercentage < 40 && 'Needs improvement'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Score Breakdown</h2>
          <div className="space-y-4">
            {metrics.map((metric, index) => {
              const percentage = (metric.score / metric.maxScore) * 100;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {metric.score}/{metric.maxScore}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: metric.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{metric.details}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Recommendations</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {metrics[0].score < 20 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Try to save at least 20% of your income each month</span>
            </li>
          )}
          {metrics[1].score < 15 && budgets.length === 0 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Set up budgets for your main spending categories</span>
            </li>
          )}
          {metrics[2].score < 10 && goals.length === 0 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Create financial goals to stay motivated and track progress</span>
            </li>
          )}
          {metrics[4].score < 5 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Track your transactions daily for better financial awareness</span>
            </li>
          )}
          {overallPercentage >= 80 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Great job! Keep up your excellent financial habits</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FinancialHealthScore;
