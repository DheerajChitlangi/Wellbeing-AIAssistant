import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { sleepApi } from '../../services/api';
import type { SleepEntry } from '../../types';

const SleepQualityView: React.FC = () => {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchSleepData();
  }, []);

  const fetchSleepData = async () => {
    try {
      setLoading(true);
      const response = await sleepApi.getAll(0, 100);
      setSleepEntries(response.data);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEntries = () => {
    const now = new Date();
    const cutoffDate = new Date();

    if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else {
      cutoffDate.setMonth(now.getMonth() - 1);
    }

    return sleepEntries.filter(e => new Date(e.created_at || '') >= cutoffDate);
  };

  const getSleepTrend = () => {
    const filtered = getFilteredEntries()
      .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
      .slice(-30);

    return filtered.map(entry => ({
      date: new Date(entry.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: entry.sleep_hours,
      quality: entry.sleep_quality,
    }));
  };

  const getSleepScore = () => {
    const filtered = getFilteredEntries();
    if (filtered.length === 0) return 0;

    const avgHours = filtered.reduce((sum, e) => sum + e.sleep_hours, 0) / filtered.length;
    const avgQuality = filtered.reduce((sum, e) => sum + e.sleep_quality, 0) / filtered.length;

    const hoursScore = Math.min((avgHours / 8) * 50, 50);
    const qualityScore = (avgQuality / 10) * 50;

    return Math.round(hoursScore + qualityScore);
  };

  const getSleepConsistency = () => {
    const filtered = getFilteredEntries();
    if (filtered.length < 2) return 100;

    const bedtimes = filtered
      .filter(e => e.bedtime)
      .map(e => {
        const time = new Date(e.bedtime!);
        return time.getHours() * 60 + time.getMinutes();
      });

    if (bedtimes.length < 2) return 100;

    const avg = bedtimes.reduce((sum, t) => sum + t, 0) / bedtimes.length;
    const variance = bedtimes.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / bedtimes.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, Math.min(100, 100 - (stdDev / 60) * 10));
  };

  const getQualityDistribution = () => {
    const filtered = getFilteredEntries();
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };

    filtered.forEach(entry => {
      if (entry.sleep_quality >= 8) distribution.excellent++;
      else if (entry.sleep_quality >= 6) distribution.good++;
      else if (entry.sleep_quality >= 4) distribution.fair++;
      else distribution.poor++;
    });

    return [
      { name: 'Excellent (8-10)', value: distribution.excellent, color: '#10b981' },
      { name: 'Good (6-8)', value: distribution.good, color: '#3b82f6' },
      { name: 'Fair (4-6)', value: distribution.fair, color: '#f59e0b' },
      { name: 'Poor (0-4)', value: distribution.poor, color: '#ef4444' },
    ].filter(d => d.value > 0);
  };

  const getSleepMetrics = () => {
    const filtered = getFilteredEntries();
    if (filtered.length === 0) {
      return [
        { metric: 'Duration', score: 0, target: 100 },
        { metric: 'Quality', score: 0, target: 100 },
        { metric: 'Consistency', score: 0, target: 100 },
      ];
    }

    const avgHours = filtered.reduce((sum, e) => sum + e.sleep_hours, 0) / filtered.length;
    const avgQuality = filtered.reduce((sum, e) => sum + e.sleep_quality, 0) / filtered.length;
    const consistency = getSleepConsistency();

    return [
      { metric: 'Duration', score: Math.min((avgHours / 8) * 100, 100), target: 100 },
      { metric: 'Quality', score: avgQuality * 10, target: 100 },
      { metric: 'Consistency', score: consistency, target: 100 },
    ];
  };

  const getStats = () => {
    const filtered = getFilteredEntries();
    const avgHours = filtered.length > 0
      ? filtered.reduce((sum, e) => sum + e.sleep_hours, 0) / filtered.length
      : 0;
    const avgQuality = filtered.length > 0
      ? filtered.reduce((sum, e) => sum + e.sleep_quality, 0) / filtered.length
      : 0;

    const lastWeek = sleepEntries.slice(-7);
    const weekAvgHours = lastWeek.length > 0
      ? lastWeek.reduce((sum, e) => sum + e.sleep_hours, 0) / lastWeek.length
      : 0;

    return {
      totalNights: filtered.length,
      avgHours,
      avgQuality,
      weekAvgHours,
      sleepScore: getSleepScore(),
      consistency: getSleepConsistency(),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading sleep data...</div>
      </div>
    );
  }

  const stats = getStats();
  const sleepTrend = getSleepTrend();
  const qualityDistribution = getQualityDistribution();
  const sleepMetrics = getSleepMetrics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Sleep Quality</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="text-sm font-medium mb-2">Sleep Score</div>
          <div className="text-4xl font-bold">{stats.sleepScore}</div>
          <div className="text-sm mt-2 opacity-90">out of 100</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Avg Sleep</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.avgHours.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-400 mt-1">Target: 7-9h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Avg Quality</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.avgQuality.toFixed(1)}/10
          </div>
          <div className="text-xs text-gray-400 mt-1">Last {stats.totalNights} nights</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Consistency</div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.consistency.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">Bedtime regularity</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sleep Duration</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={sleepTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 12]} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="hours" fill="#8b5cf6" fillOpacity={0.3} stroke="none" />
              <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={3} name="Hours" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sleep Quality Score</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sleepTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={3} name="Quality (0-10)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quality Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={qualityDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Nights">
                {qualityDistribution.map((entry, index) => (
                  <rect key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sleep Metrics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={sleepMetrics}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sleep Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-2">This Week</div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.weekAvgHours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-500 mt-1">avg per night</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-2">Sleep Debt</div>
            <div className={`text-2xl font-bold ${stats.avgHours >= 7 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.avgHours >= 7 ? '0h' : `${(7 - stats.avgHours).toFixed(1)}h`}
            </div>
            <div className="text-sm text-gray-500 mt-1">below target</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-2">Recommendation</div>
            <div className="text-sm text-gray-700 mt-2">
              {stats.avgHours < 7
                ? 'Try going to bed 30 minutes earlier'
                : stats.consistency < 70
                ? 'Maintain a consistent bedtime'
                : 'Great sleep habits! Keep it up'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepQualityView;
