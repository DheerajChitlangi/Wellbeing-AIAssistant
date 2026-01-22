import React, { useState, useEffect } from 'react';
import { dailyBriefingApi } from '../services/api';
import type { DailyBriefing } from '../types';

const DailyBriefingPage: React.FC = () => {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchBriefing();
  }, [selectedDate]);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      const response = await dailyBriefingApi.get(selectedDate);
      setBriefing(response.data);
    } catch (error) {
      console.error('Error fetching daily briefing:', error);
      setBriefing(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBriefing = async () => {
    try {
      setLoading(true);
      const response = await dailyBriefingApi.generate();
      setBriefing(response.data);
    } catch (error) {
      console.error('Error generating briefing:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getPriorityIcon = (pillar: string) => {
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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading your daily briefing...</div>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Briefing Available
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find a briefing for this date. Would you like to generate one?
            </p>
            <button
              onClick={handleGenerateBriefing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Daily Briefing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {getGreeting()}! 👋
              </h1>
              <p className="text-gray-600">
                {new Date(briefing.briefing_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleGenerateBriefing}
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Today's Summary
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {briefing.summary}
          </p>
        </div>

        {/* Alerts */}
        {briefing.alerts && briefing.alerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🚨</span>
              Urgent Alerts
            </h2>
            <div className="space-y-3">
              {briefing.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`border-l-4 rounded-lg p-4 ${getSeverityColor(
                    alert.severity
                  )}`}
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase">
                          {alert.severity}
                        </span>
                        <span className="text-xs">• {alert.pillar}</span>
                      </div>
                      <p className="font-medium">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Priorities */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">🎯</span>
            Top 3 Priorities for Today
          </h2>
          <div className="space-y-4">
            {briefing.top_priorities.map((priority, index) => (
              <div
                key={index}
                className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold mr-4 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getPriorityIcon(priority.pillar)}</span>
                    <span className="text-sm text-gray-500 uppercase font-semibold">
                      {priority.pillar}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {priority.title}
                  </h3>
                  <p className="text-gray-600">{priority.action}</p>
                </div>
                <div className="ml-4">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">📈</span>
            Today's Key Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(briefing.key_metrics).map(([key, value]) => (
              <div
                key={key}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4"
              >
                <p className="text-sm text-gray-600 mb-1 capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {typeof value === 'number' ? value.toFixed(1) : value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Message */}
        {briefing.motivational_message && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-8 mb-6 text-white">
            <div className="flex items-start">
              <span className="text-4xl mr-4">💪</span>
              <div>
                <h2 className="text-2xl font-bold mb-3">Today's Motivation</h2>
                <p className="text-lg leading-relaxed">
                  {briefing.motivational_message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">New Insights</p>
              <p className="text-4xl font-bold text-blue-600">
                {briefing.insights_count}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Action Items</p>
              <p className="text-4xl font-bold text-green-600">
                {briefing.recommendations_count}
              </p>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View All Insights
            </button>
            <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              View Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyBriefingPage;
