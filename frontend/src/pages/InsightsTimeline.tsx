import React, { useState, useEffect } from 'react';
import { insightApi } from '../services/api';
import type { Insight } from '../types';

const InsightsTimeline: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPillar, setFilterPillar] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [filterPillar, filterType, filterSeverity, showUnreadOnly]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      if (showUnreadOnly) {
        const response = await insightApi.getUnread();
        setInsights(response.data);
      } else {
        const pillar = filterPillar === 'all' ? undefined : filterPillar;
        const severity = filterSeverity === 'all' ? undefined : filterSeverity;
        const response = await insightApi.getAll(undefined, pillar, severity);
        setInsights(response.data);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await insightApi.markAsRead(id);
      fetchInsights();
    } catch (error) {
      console.error('Error marking insight as read:', error);
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
      case 'cross-pillar':
        return '🔗';
      default:
        return '📌';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'trend':
        return '📈';
      case 'anomaly':
        return '⚡';
      case 'achievement':
        return '🎉';
      case 'warning':
        return '⚠️';
      default:
        return '💡';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const groupInsightsByDate = () => {
    const grouped: { [key: string]: Insight[] } = {};

    insights.forEach((insight) => {
      const date = new Date(insight.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(insight);
    });

    return Object.entries(grouped).sort((a, b) =>
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  };

  const filteredInsights = insights.filter((insight) => {
    if (filterType !== 'all' && insight.insight_type !== filterType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading insights...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Insights Timeline 💡
          </h1>
          <p className="text-gray-600">
            Your personalized wellbeing insights, discoveries, and achievements
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pillar
              </label>
              <select
                value={filterPillar}
                onChange={(e) => setFilterPillar(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Pillars</option>
                <option value="financial">Financial</option>
                <option value="health">Health</option>
                <option value="worklife">Work-Life</option>
                <option value="productivity">Productivity</option>
                <option value="cross-pillar">Cross-Pillar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="trend">Trends</option>
                <option value="anomaly">Anomalies</option>
                <option value="achievement">Achievements</option>
                <option value="warning">Warnings</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`w-full px-4 py-2 rounded-lg font-medium ${
                  showUnreadOnly
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {showUnreadOnly ? 'Unread Only' : 'All Insights'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-2">Total Insights</p>
            <p className="text-3xl font-bold text-blue-600">
              {filteredInsights.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-2">Unread</p>
            <p className="text-3xl font-bold text-purple-600">
              {filteredInsights.filter((i) => !i.is_read).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-2">Achievements</p>
            <p className="text-3xl font-bold text-green-600">
              {filteredInsights.filter((i) => i.insight_type === 'achievement').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-2">Warnings</p>
            <p className="text-3xl font-bold text-red-600">
              {filteredInsights.filter((i) => i.insight_type === 'warning').length}
            </p>
          </div>
        </div>

        {/* Timeline */}
        {filteredInsights.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              No Insights Found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for new insights.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupInsightsByDate().map(([date, dateInsights]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="sticky top-0 bg-gray-50 py-2 z-10">
                  <h2 className="text-xl font-bold text-gray-700 flex items-center">
                    <span className="mr-2">📅</span>
                    {date}
                  </h2>
                </div>

                {/* Insights for this date */}
                <div className="relative pl-8 space-y-6">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-300" />

                  {dateInsights.map((insight) => (
                    <div key={insight.id} className="relative">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-5 w-3 h-3 rounded-full ${
                          insight.is_read ? 'bg-gray-400' : 'bg-blue-600'
                        }`}
                      />

                      {/* Insight Card */}
                      <div
                        className={`bg-white rounded-lg shadow-md border-l-4 ${getSeverityColor(
                          insight.severity
                        )} ${!insight.is_read ? 'ring-2 ring-blue-300' : ''}`}
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">
                                {getTypeIcon(insight.insight_type)}
                              </span>
                              <span className="text-2xl">
                                {getPillarIcon(insight.pillar)}
                              </span>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityBadgeColor(
                                      insight.severity
                                    )}`}
                                  >
                                    {insight.severity.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-500 uppercase">
                                    {insight.pillar}
                                  </span>
                                  <span className="text-xs text-gray-500 uppercase">
                                    {insight.insight_type}
                                  </span>
                                  {insight.confidence_score && (
                                    <span className="text-xs text-gray-500">
                                      {insight.confidence_score.toFixed(0)}% confidence
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {!insight.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(insight.id)}
                                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>

                          {/* Content */}
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {insight.title}
                          </h3>
                          <p className="text-gray-700 leading-relaxed mb-4">
                            {insight.description}
                          </p>

                          {/* Data Points */}
                          {insight.data_points && Object.keys(insight.data_points).length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                Supporting Data:
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                {Object.entries(insight.data_points).map(([key, value]) => (
                                  <div key={key} className="text-sm">
                                    <span className="text-gray-600 capitalize">
                                      {key.replace(/_/g, ' ')}:
                                    </span>
                                    <span className="ml-2 font-semibold text-gray-900">
                                      {typeof value === 'number'
                                        ? value.toFixed(2)
                                        : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Achievement Celebration */}
                          {insight.insight_type === 'achievement' && (
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-300 rounded-lg p-4">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">🎊</span>
                                <span className="font-semibold text-green-700">
                                  Congratulations on this achievement!
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Action Required */}
                          {insight.actionable && (
                            <div className="mt-4 flex gap-3">
                              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                                Get Recommendations
                              </button>
                              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">
                                Learn More
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-3 rounded-b-lg">
                          <p className="text-xs text-gray-500">
                            {new Date(insight.created_at).toLocaleTimeString()} •{' '}
                            {insight.time_period}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsTimeline;
