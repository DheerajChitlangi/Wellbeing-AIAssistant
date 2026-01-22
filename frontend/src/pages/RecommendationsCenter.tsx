import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';
import { recommendationApi } from '../services/api';
import type { Recommendation } from '../types';

const RecommendationsCenter: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPillar, setFilterPillar] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [filterPillar, filterStatus]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const pillar = filterPillar === 'all' ? undefined : filterPillar;
      const status = filterStatus === 'all' ? undefined : filterStatus;
      const response = await recommendationApi.getAll(pillar, status);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recommendationApi.generate();
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string, outcome?: string) => {
    try {
      await recommendationApi.update(id, { status, outcome });
      fetchRecommendations();
    } catch (error) {
      console.error('Error updating recommendation:', error);
    }
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar.toLowerCase()) {
      case 'financial':
        return '💰';
      case 'health':
        return '❤️';
      case 'worklife':
        return '⚖️';
      case 'productivity':
        return '🎯';
      default:
        return '📌';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 4) return 'bg-red-500 text-white';
    if (priority >= 3) return 'bg-orange-500 text-white';
    return 'bg-blue-500 text-white';
  };

  // Convert recommendations to matrix data
  const getMatrixData = () => {
    const effortMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
    const impactMap: Record<string, number> = { low: 1, medium: 2, high: 3 };

    return recommendations.map((rec) => ({
      id: rec.id,
      x: effortMap[rec.estimated_effort],
      y: impactMap[rec.expected_impact],
      z: rec.priority * 10,
      title: rec.title,
      pillar: rec.pillar,
    }));
  };

  const getMatrixQuadrant = (impact: string, effort: string) => {
    if (impact === 'high' && effort === 'low') {
      return { label: '🎯 Quick Wins', color: 'bg-green-50 border-green-300' };
    }
    if (impact === 'high' && effort === 'high') {
      return { label: '🚀 Major Projects', color: 'bg-blue-50 border-blue-300' };
    }
    if (impact === 'low' && effort === 'low') {
      return { label: '⚡ Fill-Ins', color: 'bg-yellow-50 border-yellow-300' };
    }
    return { label: '⏸️ Low Priority', color: 'bg-gray-50 border-gray-300' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading recommendations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Recommendations Center
          </h1>
          <p className="text-gray-600">
            AI-powered action items to improve your wellbeing
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pillar
              </label>
              <select
                value={filterPillar}
                onChange={(e) => setFilterPillar(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Pillars</option>
                <option value="financial">Financial</option>
                <option value="health">Health</option>
                <option value="worklife">Work-Life</option>
                <option value="productivity">Productivity</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`px-4 py-2 rounded-lg ${
                    viewMode === 'matrix'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Matrix
                </button>
              </div>
            </div>

            <div className="ml-auto">
              <button
                onClick={handleGenerateRecommendations}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Generate New Recommendations
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-2">Pending</p>
            <p className="text-3xl font-bold text-blue-600">
              {recommendations.filter((r) => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-2">Accepted</p>
            <p className="text-3xl font-bold text-green-600">
              {recommendations.filter((r) => r.status === 'accepted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-2">Completed</p>
            <p className="text-3xl font-bold text-purple-600">
              {recommendations.filter((r) => r.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-2">High Impact</p>
            <p className="text-3xl font-bold text-orange-600">
              {recommendations.filter((r) => r.expected_impact === 'high').length}
            </p>
          </div>
        </div>

        {/* Matrix View */}
        {viewMode === 'matrix' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Impact vs Effort Matrix
            </h2>
            <ResponsiveContainer width="100%" height={500}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Effort"
                  domain={[0.5, 3.5]}
                  ticks={[1, 2, 3]}
                  tickFormatter={(value) =>
                    ['', 'Low', 'Medium', 'High'][value] || ''
                  }
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Impact"
                  domain={[0.5, 3.5]}
                  ticks={[1, 2, 3]}
                  tickFormatter={(value) =>
                    ['', 'Low', 'Medium', 'High'][value] || ''
                  }
                />
                <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border">
                          <p className="font-semibold">{data.title}</p>
                          <p className="text-sm text-gray-600">{data.pillar}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={getMatrixData()} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {recommendations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  No Recommendations Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Generate AI-powered recommendations based on your data
                </p>
                <button
                  onClick={handleGenerateRecommendations}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Generate Recommendations
                </button>
              </div>
            ) : (
              recommendations.map((rec) => {
                const quadrant = getMatrixQuadrant(
                  rec.expected_impact,
                  rec.estimated_effort
                );

                return (
                  <div
                    key={rec.id}
                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 ${quadrant.color}`}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">
                              {getPillarIcon(rec.pillar)}
                            </span>
                            <span className="text-sm text-gray-500 uppercase">
                              {rec.pillar}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(
                                rec.priority
                              )}`}
                            >
                              Priority {rec.priority}
                            </span>
                            <span className="text-sm px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {quadrant.label}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {rec.title}
                          </h3>
                          <p className="text-gray-700 mb-4">{rec.description}</p>

                          <div className="flex gap-4 mb-4">
                            <div
                              className={`px-3 py-1 rounded-lg text-sm font-medium border ${getImpactColor(
                                rec.expected_impact
                              )}`}
                            >
                              {rec.expected_impact.toUpperCase()} Impact
                            </div>
                            <div
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${getEffortColor(
                                rec.estimated_effort
                              )}`}
                            >
                              {rec.estimated_effort.toUpperCase()} Effort
                            </div>
                          </div>

                          {/* Action Items */}
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              Action Items:
                            </h4>
                            <ul className="space-y-2">
                              {rec.action_items.map((item, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-gray-700"
                                >
                                  <input
                                    type="checkbox"
                                    className="mt-1"
                                    disabled={rec.status !== 'accepted'}
                                  />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Reasoning */}
                          {rec.reasoning && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                              <p className="text-sm text-gray-700">
                                <strong>Why this matters:</strong> {rec.reasoning}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            {rec.status === 'pending' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(rec.id, 'accepted')
                                  }
                                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(rec.id, 'dismissed')
                                  }
                                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                            {rec.status === 'accepted' && (
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    rec.id,
                                    'completed',
                                    'Completed successfully'
                                  )
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Mark Complete
                              </button>
                            )}
                            {rec.status === 'completed' && (
                              <div className="flex items-center gap-2 text-green-600">
                                <span className="text-2xl">✅</span>
                                <span className="font-semibold">Completed</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            rec.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : rec.status === 'accepted'
                              ? 'bg-blue-100 text-blue-700'
                              : rec.status === 'dismissed'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {rec.status.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-3 rounded-b-lg">
                      <p className="text-xs text-gray-500">
                        Created {new Date(rec.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsCenter;
