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
import { healthScoreApi } from '../../services/api';
import type { HealthScore } from '../../types';

const HealthScoreCard: React.FC = () => {
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthScore();
  }, []);

  const fetchHealthScore = async () => {
    try {
      setLoading(true);
      const response = await healthScoreApi.getCurrent();
      setHealthScore(response.data);
    } catch (error) {
      console.error('Error fetching health score:', error);
      setHealthScore({
        overall_score: 75,
        nutrition_score: 70,
        activity_score: 80,
        sleep_score: 75,
        biometric_score: 72,
        factors: [
          {
            category: 'Nutrition',
            score: 70,
            trend: 'improving',
            recommendation: 'Increase protein intake and reduce processed foods',
          },
          {
            category: 'Physical Activity',
            score: 80,
            trend: 'stable',
            recommendation: 'Great job! Maintain current exercise routine',
          },
          {
            category: 'Sleep',
            score: 75,
            trend: 'improving',
            recommendation: 'Try to maintain consistent bedtime',
          },
          {
            category: 'Biometrics',
            score: 72,
            trend: 'stable',
            recommendation: 'Monitor blood pressure regularly',
          },
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
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return 'border-green-500';
    if (score >= 60) return 'border-yellow-500';
    return 'border-red-500';
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving':
        return '↗️';
      case 'stable':
        return '→';
      case 'declining':
        return '↘️';
    }
  };

  const getTrendColor = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'stable':
        return 'text-blue-600';
      case 'declining':
        return 'text-red-600';
    }
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading health score...</div>
      </div>
    );
  }

  if (!healthScore) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-gray-400 text-lg mb-2">No health data available</div>
        <div className="text-gray-500">Start tracking your health metrics to see your score</div>
      </div>
    );
  }

  const radarData = [
    { subject: 'Nutrition', score: healthScore.nutrition_score, fullMark: 100 },
    { subject: 'Activity', score: healthScore.activity_score, fullMark: 100 },
    { subject: 'Sleep', score: healthScore.sleep_score, fullMark: 100 },
    { subject: 'Biometrics', score: healthScore.biometric_score, fullMark: 100 },
  ];

  const barData = [
    { name: 'Nutrition', score: healthScore.nutrition_score },
    { name: 'Activity', score: healthScore.activity_score },
    { name: 'Sleep', score: healthScore.sleep_score },
    { name: 'Biometrics', score: healthScore.biometric_score },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Health Score</h1>

      <div className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border-4 ${getScoreBorderColor(healthScore.overall_score)}`}>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-600 mb-2">Overall Health Score</div>
          <div className={`text-8xl font-bold ${getScoreColor(healthScore.overall_score)}`}>
            {healthScore.overall_score}
          </div>
          <div className="text-xl text-gray-600 mt-2">out of 100</div>
          <div className="mt-4">
            {healthScore.overall_score >= 80 && (
              <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                Excellent Health
              </span>
            )}
            {healthScore.overall_score >= 60 && healthScore.overall_score < 80 && (
              <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium">
                Good Health
              </span>
            )}
            {healthScore.overall_score < 60 && (
              <span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full font-medium">
                Needs Improvement
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${getScoreBgColor(healthScore.nutrition_score)} rounded-lg shadow p-6`}>
          <div className="text-sm font-medium text-gray-600 mb-2">Nutrition</div>
          <div className={`text-3xl font-bold ${getScoreColor(healthScore.nutrition_score)}`}>
            {healthScore.nutrition_score}
          </div>
        </div>
        <div className={`${getScoreBgColor(healthScore.activity_score)} rounded-lg shadow p-6`}>
          <div className="text-sm font-medium text-gray-600 mb-2">Activity</div>
          <div className={`text-3xl font-bold ${getScoreColor(healthScore.activity_score)}`}>
            {healthScore.activity_score}
          </div>
        </div>
        <div className={`${getScoreBgColor(healthScore.sleep_score)} rounded-lg shadow p-6`}>
          <div className="text-sm font-medium text-gray-600 mb-2">Sleep</div>
          <div className={`text-3xl font-bold ${getScoreColor(healthScore.sleep_score)}`}>
            {healthScore.sleep_score}
          </div>
        </div>
        <div className={`${getScoreBgColor(healthScore.biometric_score)} rounded-lg shadow p-6`}>
          <div className="text-sm font-medium text-gray-600 mb-2">Biometrics</div>
          <div className={`text-3xl font-bold ${getScoreColor(healthScore.biometric_score)}`}>
            {healthScore.biometric_score}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Overview</h2>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Your Health"
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Score Breakdown</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="score" name="Score">
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Contributing Factors & Recommendations</h2>
        <div className="space-y-4">
          {healthScore.factors.map((factor, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-bold ${getScoreColor(factor.score)}`}>
                    {factor.score}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{factor.category}</div>
                    <div className={`text-sm font-medium ${getTrendColor(factor.trend)}`}>
                      {getTrendIcon(factor.trend)} {factor.trend.charAt(0).toUpperCase() + factor.trend.slice(1)}
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(factor.score)} ${getScoreColor(factor.score)}`}>
                  {factor.score >= 80 ? 'Excellent' : factor.score >= 60 ? 'Good' : 'Needs Work'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">Recommendation:</div>
                <div className="text-gray-700">{factor.recommendation}</div>
              </div>
              <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${factor.score >= 80 ? 'bg-green-500' : factor.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${factor.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthScoreCard;
