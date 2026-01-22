import React, { useState, useEffect } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { workLifeBalanceApi } from '../../services/api';
import type { WorkLifeBalance } from '../../types';

const BurnoutRiskAlert: React.FC = () => {
  const [balanceData, setBalanceData] = useState<WorkLifeBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const fetchBalanceData = async () => {
    try {
      setLoading(true);
      const response = await workLifeBalanceApi.getCurrent();
      setBalanceData(response.data);
    } catch (error) {
      console.error('Error fetching balance data:', error);
      setBalanceData({
        balance_score: 65,
        burnout_risk: 'medium',
        work_hours_weekly: 48,
        meeting_hours_weekly: 15,
        boundary_violations_count: 12,
        recommendations: [
          'Reduce work hours to target of 40-45 hours per week',
          'Limit after-hours work and weekend interruptions',
          'Take regular breaks during the workday',
          'Schedule time for rest and recovery activities',
          'Consider delegating some responsibilities',
        ],
        trends: [
          { metric: 'Work Hours', trend: 'worsening', value: 48 },
          { metric: 'Meeting Load', trend: 'stable', value: 15 },
          { metric: 'Boundaries', trend: 'worsening', value: 12 },
          { metric: 'Energy Levels', trend: 'declining', value: 55 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = () => {
    if (!balanceData) return { level: 'unknown', color: 'gray', icon: '❓', severity: 0 };

    switch (balanceData.burnout_risk) {
      case 'low':
        return { level: 'Low Risk', color: 'green', icon: '✅', severity: 1 };
      case 'medium':
        return { level: 'Medium Risk', color: 'yellow', icon: '⚠️', severity: 2 };
      case 'high':
        return { level: 'High Risk', color: 'red', icon: '🚨', severity: 3 };
      default:
        return { level: 'Unknown', color: 'gray', icon: '❓', severity: 0 };
    }
  };

  const getBurnoutFactors = () => {
    if (!balanceData) return [];

    const factors: { name: string; score: number; status: 'good' | 'warning' | 'critical' }[] = [];

    factors.push({
      name: 'Work Hours',
      score: balanceData.work_hours_weekly > 50 ? 90 : balanceData.work_hours_weekly > 45 ? 60 : 30,
      status: balanceData.work_hours_weekly > 50 ? 'critical' : balanceData.work_hours_weekly > 45 ? 'warning' : 'good',
    });

    factors.push({
      name: 'Meeting Load',
      score: balanceData.meeting_hours_weekly > 25 ? 85 : balanceData.meeting_hours_weekly > 20 ? 55 : 25,
      status: balanceData.meeting_hours_weekly > 25 ? 'critical' : balanceData.meeting_hours_weekly > 20 ? 'warning' : 'good',
    });

    factors.push({
      name: 'Boundary Violations',
      score: balanceData.boundary_violations_count > 15 ? 95 : balanceData.boundary_violations_count > 10 ? 65 : 35,
      status: balanceData.boundary_violations_count > 15 ? 'critical' : balanceData.boundary_violations_count > 10 ? 'warning' : 'good',
    });

    factors.push({
      name: 'Work-Life Balance',
      score: 100 - balanceData.balance_score,
      status: balanceData.balance_score < 50 ? 'critical' : balanceData.balance_score < 70 ? 'warning' : 'good',
    });

    return factors;
  };

  const getFactorColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
    }
  };

  const getActionItems = () => {
    if (!balanceData) return [];

    const actions: { priority: 'high' | 'medium' | 'low'; action: string; impact: string }[] = [];

    if (balanceData.work_hours_weekly > 50) {
      actions.push({
        priority: 'high',
        action: 'Immediately reduce work hours',
        impact: 'Critical for preventing burnout',
      });
    }

    if (balanceData.boundary_violations_count > 10) {
      actions.push({
        priority: 'high',
        action: 'Establish and enforce work boundaries',
        impact: 'Protect personal time and recovery',
      });
    }

    if (balanceData.meeting_hours_weekly > 20) {
      actions.push({
        priority: 'medium',
        action: 'Review and reduce unnecessary meetings',
        impact: 'Free up time for deep work',
      });
    }

    if (balanceData.balance_score < 70) {
      actions.push({
        priority: 'medium',
        action: 'Schedule regular breaks and time off',
        impact: 'Improve overall wellbeing',
      });
    }

    actions.push({
      priority: 'low',
      action: 'Practice stress management techniques',
      impact: 'Build resilience',
    });

    return actions;
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Analyzing burnout risk...</div>
      </div>
    );
  }

  const riskInfo = getRiskLevel();
  const burnoutFactors = getBurnoutFactors();
  const actionItems = getActionItems();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Burnout Risk Assessment</h1>

      <div className={`bg-gradient-to-br from-${riskInfo.color}-50 to-${riskInfo.color}-100 border-4 border-${riskInfo.color}-400 rounded-2xl shadow-lg p-8`}>
        <div className="text-center">
          <div className="text-6xl mb-4">{riskInfo.icon}</div>
          <div className="text-sm font-medium text-gray-700 mb-2">Current Burnout Risk</div>
          <div className={`text-5xl font-bold text-${riskInfo.color}-600 mb-4`}>
            {riskInfo.level}
          </div>
          {riskInfo.severity >= 2 && (
            <div className="bg-white rounded-lg p-4 mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">⚠️ Warning</div>
              <div className="text-gray-600">
                Your burnout risk is elevated. Please review the recommendations below and take immediate action.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {balanceData && (
          <>
            <div className={`rounded-lg shadow p-4 ${balanceData.work_hours_weekly > 50 ? 'bg-red-100' : balanceData.work_hours_weekly > 45 ? 'bg-yellow-100' : 'bg-green-100'}`}>
              <div className="text-sm font-medium text-gray-600 mb-2">Weekly Hours</div>
              <div className={`text-2xl font-bold ${balanceData.work_hours_weekly > 50 ? 'text-red-600' : balanceData.work_hours_weekly > 45 ? 'text-yellow-600' : 'text-green-600'}`}>
                {balanceData.work_hours_weekly}h
              </div>
              <div className="text-xs text-gray-500 mt-1">Target: 40-45h</div>
            </div>

            <div className={`rounded-lg shadow p-4 ${balanceData.meeting_hours_weekly > 25 ? 'bg-red-100' : balanceData.meeting_hours_weekly > 20 ? 'bg-yellow-100' : 'bg-green-100'}`}>
              <div className="text-sm font-medium text-gray-600 mb-2">Meeting Hours</div>
              <div className={`text-2xl font-bold ${balanceData.meeting_hours_weekly > 25 ? 'text-red-600' : balanceData.meeting_hours_weekly > 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                {balanceData.meeting_hours_weekly}h
              </div>
              <div className="text-xs text-gray-500 mt-1">Target: &lt;20h</div>
            </div>

            <div className={`rounded-lg shadow p-4 ${balanceData.boundary_violations_count > 15 ? 'bg-red-100' : balanceData.boundary_violations_count > 10 ? 'bg-yellow-100' : 'bg-green-100'}`}>
              <div className="text-sm font-medium text-gray-600 mb-2">Violations</div>
              <div className={`text-2xl font-bold ${balanceData.boundary_violations_count > 15 ? 'text-red-600' : balanceData.boundary_violations_count > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                {balanceData.boundary_violations_count}
              </div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </div>

            <div className={`rounded-lg shadow p-4 ${balanceData.balance_score < 50 ? 'bg-red-100' : balanceData.balance_score < 70 ? 'bg-yellow-100' : 'bg-green-100'}`}>
              <div className="text-sm font-medium text-gray-600 mb-2">Balance Score</div>
              <div className={`text-2xl font-bold ${balanceData.balance_score < 50 ? 'text-red-600' : balanceData.balance_score < 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                {balanceData.balance_score}/100
              </div>
              <div className="text-xs text-gray-500 mt-1">Target: &gt;70</div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Burnout Risk Factors</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={burnoutFactors} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="category" dataKey="name" />
            <YAxis type="number" domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" name="Risk Level">
              {burnoutFactors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getFactorColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Critical</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Action Plan</h2>
        <div className="space-y-3">
          {actionItems.map((item, index) => (
            <div
              key={index}
              className={`border-2 rounded-lg p-4 ${getPriorityColor(item.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-white bg-opacity-50">
                      {item.priority} priority
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">{item.action}</div>
                  <div className="text-sm text-gray-700">{item.impact}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {balanceData && balanceData.recommendations && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personalized Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {balanceData.recommendations.map((recommendation, index) => (
              <div key={index} className="bg-white rounded-lg p-4 flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div className="flex-1 text-gray-700">{recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Prevention Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="text-3xl mb-2">🧘</div>
            <div className="font-semibold text-gray-900 mb-2">Practice Self-Care</div>
            <div className="text-sm text-gray-700">
              Regular exercise, healthy eating, and adequate sleep are essential for preventing burnout
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="font-semibold text-gray-900 mb-2">Set Boundaries</div>
            <div className="text-sm text-gray-700">
              Establish clear work-life boundaries and protect your personal time
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="text-3xl mb-2">🤝</div>
            <div className="font-semibold text-gray-900 mb-2">Seek Support</div>
            <div className="text-sm text-gray-700">
              Connect with colleagues, friends, and family. Consider professional support if needed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BurnoutRiskAlert;
