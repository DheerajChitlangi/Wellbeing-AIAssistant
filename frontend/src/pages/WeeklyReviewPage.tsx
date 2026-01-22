import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { weeklyReviewApi } from '../services/api';
import type { WeeklyReview } from '../types';

const WeeklyReviewPage: React.FC = () => {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'financial' | 'health' | 'worklife' | 'productivity'>('overview');

  useEffect(() => {
    fetchLatestReview();
  }, []);

  const fetchLatestReview = async () => {
    try {
      setLoading(true);
      const response = await weeklyReviewApi.getLatest();
      setReview(response.data);
    } catch (error) {
      console.error('Error fetching weekly review:', error);
      setReview(null);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getPillarData = () => {
    if (!review) return [];

    return [
      {
        pillar: 'Financial',
        score: review.financial_summary?.score || 0,
        icon: '💰',
      },
      {
        pillar: 'Health',
        score: review.health_summary?.score || 0,
        icon: '❤️',
      },
      {
        pillar: 'Work-Life',
        score: review.worklife_summary?.score || 0,
        icon: '⚖️',
      },
      {
        pillar: 'Productivity',
        score: review.productivity_summary?.score || 0,
        icon: '🎯',
      },
    ];
  };

  const downloadPDF = () => {
    alert('PDF export feature coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading your weekly review...</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Weekly Review Available
            </h2>
            <p className="text-gray-600">
              Weekly reviews are generated automatically at the end of each week.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Weekly Review 📊
              </h1>
              <p className="text-gray-600">
                {new Date(review.week_start).toLocaleDateString()} -{' '}
                {new Date(review.week_end).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-6xl font-bold ${getScoreColor(review.overall_score)}`}>
                {review.overall_score}
              </div>
              <p className="text-gray-600 mt-2">Overall Score</p>
              <button
                onClick={downloadPDF}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg p-8 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">📝</span>
            Executive Summary
          </h2>
          <p className="text-lg leading-relaxed">{review.executive_summary}</p>
        </div>

        {/* Pillar Scores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {getPillarData().map((pillar) => (
            <div
              key={pillar.pillar}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedTab(pillar.pillar.toLowerCase().replace('-', '') as any)}
            >
              <div className="text-center">
                <span className="text-4xl mb-3 block">{pillar.icon}</span>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {pillar.pillar}
                </h3>
                <div className={`text-4xl font-bold ${getScoreColor(pillar.score)}`}>
                  {pillar.score}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wins and Concerns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Wins */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🎉</span>
              Wins & Achievements
            </h2>
            <ul className="space-y-3">
              {review.wins.map((win, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                >
                  <span className="text-green-600 font-bold text-xl">✓</span>
                  <span className="text-gray-700">{win}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Concerns */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              Areas for Improvement
            </h2>
            <ul className="space-y-3">
              {review.concerns.map((concern, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg"
                >
                  <span className="text-yellow-600 font-bold text-xl">!</span>
                  <span className="text-gray-700">{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">🎯</span>
            Goals Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className="text-gray-600 mb-2">Goals On Track</p>
              <p className="text-5xl font-bold text-green-600">
                {review.goals_on_track}
              </p>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <p className="text-gray-600 mb-2">Goals At Risk</p>
              <p className="text-5xl font-bold text-red-600">
                {review.goals_at_risk}
              </p>
            </div>
          </div>

          {review.goals_progress && Object.keys(review.goals_progress).length > 0 && (
            <div className="space-y-4">
              {Object.entries(review.goals_progress).map(([goal, progress]: [string, any]) => (
                <div key={goal} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{goal}</h4>
                    <span className="text-sm text-gray-600">
                      {progress.percentage}% complete
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trends Visualization */}
        {review.trends && Object.keys(review.trends).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">📈</span>
              Week-over-Week Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={getPillarData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="pillar" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Action Items for Next Week */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-8 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            Action Items for Next Week
          </h2>
          <ul className="space-y-3">
            {review.action_items.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-white font-bold text-xl">{index + 1}.</span>
                <span className="text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pillar Details Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {['overview', 'financial', 'health', 'worklife', 'productivity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab as any)}
                  className={`px-6 py-4 font-semibold capitalize whitespace-nowrap ${
                    selectedTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.replace('worklife', 'work-life')}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Overview
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {review.executive_summary}
                </p>
              </div>
            )}

            {selectedTab === 'financial' && review.financial_summary && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Financial Summary
                </h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(review.financial_summary, null, 2)}
                </pre>
              </div>
            )}

            {selectedTab === 'health' && review.health_summary && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Health Summary
                </h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(review.health_summary, null, 2)}
                </pre>
              </div>
            )}

            {selectedTab === 'worklife' && review.worklife_summary && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Work-Life Summary
                </h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(review.worklife_summary, null, 2)}
                </pre>
              </div>
            )}

            {selectedTab === 'productivity' && review.productivity_summary && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Productivity Summary
                </h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(review.productivity_summary, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Next Week Forecast */}
        {review.next_week_forecast && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🔮</span>
              Next Week Forecast
            </h2>
            <pre className="bg-white p-4 rounded-lg overflow-auto">
              {JSON.stringify(review.next_week_forecast, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReviewPage;
