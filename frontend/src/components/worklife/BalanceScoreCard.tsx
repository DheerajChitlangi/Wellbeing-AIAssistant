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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { workLifeBalanceApi } from '../../services/api';
import type { WorkLifeBalance } from '../../types';

const BalanceScoreCard: React.FC = () => {
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
        balance_score: 72,
        burnout_risk: 'medium',
        work_hours_weekly: 45,
        meeting_hours_weekly: 12,
        boundary_violations_count: 8,
        recommendations: [
          'Reduce after-hours work to improve work-life balance',
          'Limit meetings to 4 hours per day',
          'Take regular breaks during work hours',
          'Set boundaries for weekend work',
        ],
        trends: [
          { metric: 'Work Hours', trend: 'stable', value: 45 },
          { metric: 'Meeting Load', trend: 'worsening', value: 12 },
          { metric: 'Boundaries', trend: 'improving', value: 8 },
          { metric: 'Energy Levels', trend: 'stable', value: 70 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
    }
  };

  const getRiskIcon = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return '✅';
      case 'medium':
        return '⚠️';
      case 'high':
        return '🚨';
    }
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'stable':
        return '➡️';
      case 'worsening':
        return '📉';
    }
  };

  const getTrendColor = (trend: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'stable':
        return 'text-blue-600';
      case 'worsening':
        return 'text-red-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading balance data...</div>
      </div>
    );
  }

  if (!balanceData) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-gray-400 text-lg mb-2">No balance data available</div>
        <div className="text-gray-500">Start tracking your work-life balance</div>
      </div>
    );
  }

  const radarData = balanceData.trends.map(t => ({
    metric: t.metric,
    score: t.value,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Work-Life Balance Score</h1>

      <div className={`bg-gradient-to-br ${getScoreBgColor(balanceData.balance_score)} rounded-2xl shadow-lg p-8 text-white`}>
        <div className="text-center">
          <div className="text-sm font-medium mb-2 opacity-90">Work-Life Balance Score</div>
          <div className="text-8xl font-bold">
            {balanceData.balance_score}
          </div>
          <div className="text-xl mt-2 opacity-90">out of 100</div>
          <div className="mt-6">
            <span className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-lg ${getRiskColor(balanceData.burnout_risk)}`}>
              {getRiskIcon(balanceData.burnout_risk)}
              {balanceData.burnout_risk.charAt(0).toUpperCase() + balanceData.burnout_risk.slice(1)} Burnout Risk
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Work Hours/Week</div>
          <div className={`text-3xl font-bold ${balanceData.work_hours_weekly > 50 ? 'text-red-600' : 'text-blue-600'}`}>
            {balanceData.work_hours_weekly}h
          </div>
          <div className="text-xs text-gray-400 mt-1">Target: 40-45h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Meetings/Week</div>
          <div className={`text-3xl font-bold ${balanceData.meeting_hours_weekly > 20 ? 'text-red-600' : 'text-green-600'}`}>
            {balanceData.meeting_hours_weekly}h
          </div>
          <div className="text-xs text-gray-400 mt-1">Target: &lt; 20h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Boundary Violations</div>
          <div className={`text-3xl font-bold ${balanceData.boundary_violations_count > 10 ? 'text-red-600' : 'text-orange-600'}`}>
            {balanceData.boundary_violations_count}
          </div>
          <div className="text-xs text-gray-400 mt-1">Last 30 days</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Balance Metrics</h2>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Current"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Trends</h2>
          <div className="space-y-4 mt-6">
            {balanceData.trends.map((trend, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">{trend.metric}</div>
                  <div className={`flex items-center gap-2 font-medium ${getTrendColor(trend.trend)}`}>
                    <span>{getTrendIcon(trend.trend)}</span>
                    <span className="capitalize">{trend.trend}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${trend.value >= 80 ? 'bg-green-500' : trend.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${trend.value}%` }}
                    ></div>
                  </div>
                  <div className="text-lg font-bold text-gray-700">{trend.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6">
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

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Balance Assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-4xl mb-2">
              {balanceData.balance_score >= 80 ? '😊' : balanceData.balance_score >= 60 ? '😐' : '😔'}
            </div>
            <div className="text-sm font-medium text-gray-600">Overall Wellbeing</div>
            <div className={`text-2xl font-bold mt-2 ${getScoreColor(balanceData.balance_score)}`}>
              {balanceData.balance_score >= 80 ? 'Excellent' : balanceData.balance_score >= 60 ? 'Good' : 'Needs Attention'}
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-4xl mb-2">
              {balanceData.burnout_risk === 'low' ? '✅' : balanceData.burnout_risk === 'medium' ? '⚠️' : '🚨'}
            </div>
            <div className="text-sm font-medium text-gray-600">Burnout Risk</div>
            <div className="text-2xl font-bold mt-2 capitalize">
              {balanceData.burnout_risk}
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-4xl mb-2">
              {balanceData.boundary_violations_count < 5 ? '🎯' : balanceData.boundary_violations_count < 10 ? '⚡' : '⚠️'}
            </div>
            <div className="text-sm font-medium text-gray-600">Boundary Health</div>
            <div className="text-2xl font-bold mt-2">
              {balanceData.boundary_violations_count < 5 ? 'Strong' : balanceData.boundary_violations_count < 10 ? 'Fair' : 'Weak'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceScoreCard;
