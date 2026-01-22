import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  wellbeingScoreApi,
  insightApi,
  recommendationApi,
  correlationApi,
} from '../services/api';
import type { WellbeingScore, Insight, Recommendation, Correlation } from '../types';

interface PillarCard {
  pillar: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  icon: string;
  color: string;
}

const MainDashboard: React.FC = () => {
  const [wellbeingScore, setWellbeingScore] = useState<WellbeingScore | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [scoreRes, insightsRes, recsRes, corrsRes] = await Promise.all([
        wellbeingScoreApi.get().catch(() => ({ data: null })),
        insightApi.getUnread().catch(() => ({ data: [] })),
        recommendationApi.getAll(undefined, 'pending').catch(() => ({ data: [] })),
        correlationApi.getAll(30).catch(() => ({ data: [] })),
      ]);

      setWellbeingScore(scoreRes.data);
      setInsights(insightsRes.data.slice(0, 5));
      setRecommendations(recsRes.data.slice(0, 5));
      setCorrelations(corrsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPillarCards = (): PillarCard[] => {
    if (!wellbeingScore) return [];

    return [
      {
        pillar: 'Financial',
        score: wellbeingScore.financial_score,
        trend: wellbeingScore.trend,
        icon: '💰',
        color: 'bg-green-500',
      },
      {
        pillar: 'Health',
        score: wellbeingScore.health_score,
        trend: wellbeingScore.trend,
        icon: '❤️',
        color: 'bg-red-500',
      },
      {
        pillar: 'Work-Life',
        score: wellbeingScore.worklife_score,
        trend: wellbeingScore.trend,
        icon: '⚖️',
        color: 'bg-blue-500',
      },
      {
        pillar: 'Productivity',
        score: wellbeingScore.productivity_score,
        trend: wellbeingScore.trend,
        icon: '🎯',
        color: 'bg-purple-500',
      },
    ];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Wellbeing Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Your comprehensive overview across all pillars
          </p>
        </div>

        {/* Overall Wellbeing Score */}
        {wellbeingScore && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  Overall Wellbeing Score
                </h2>
                <p className="text-gray-500">
                  {new Date(wellbeingScore.last_updated).toLocaleDateString()}
                </p>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600">
                  {wellbeingScore.overall_score}
                </div>
                <div className="text-lg text-gray-600 mt-2">
                  {getTrendIcon(wellbeingScore.trend)} {wellbeingScore.trend}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pillar Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {getPillarCards().map((pillar) => (
            <div
              key={pillar.pillar}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{pillar.icon}</span>
                <span className="text-sm text-gray-500">{getTrendIcon(pillar.trend)}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {pillar.pillar}
              </h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">
                  {pillar.score}
                </span>
                <span className="text-gray-500 ml-2">/100</span>
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div
                  className={`${pillar.color} h-2 rounded-full`}
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Insights */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Key Insights</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {insights.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No new insights available
                </p>
              ) : (
                insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(
                              insight.severity
                            )}`}
                          >
                            {insight.severity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {insight.pillar}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-800">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Action Items
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No pending recommendations
                </p>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getImpactColor(
                              rec.expected_impact
                            )}`}
                          >
                            {rec.expected_impact} impact
                          </span>
                          <span className="text-xs text-gray-500">
                            Priority {rec.priority}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-800">
                          {rec.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Accept
                      </button>
                      <button className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Discovered Correlations */}
        {correlations.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Discovered Patterns
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Explore Correlations →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {correlations.map((corr) => (
                <div
                  key={corr.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        corr.strength === 'strong'
                          ? 'bg-green-100 text-green-700'
                          : corr.strength === 'moderate'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {corr.strength} {corr.direction}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">{corr.metric_1}</span>
                    <span className="text-gray-500"> in {corr.pillar_1}</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{corr.metric_2}</span>
                    <span className="text-gray-500"> in {corr.pillar_2}</span>
                  </p>
                  {corr.insight && (
                    <p className="text-xs text-gray-600 mt-2 italic">
                      {corr.insight}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainDashboard;
