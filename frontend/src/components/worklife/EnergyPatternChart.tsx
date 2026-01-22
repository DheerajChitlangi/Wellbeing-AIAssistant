import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { energyLevelApi } from '../../services/api';
import type { EnergyLevel } from '../../types';

const EnergyPatternChart: React.FC = () => {
  const [energyLevels, setEnergyLevels] = useState<EnergyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchEnergyLevels();
  }, []);

  const fetchEnergyLevels = async () => {
    try {
      setLoading(true);
      const response = await energyLevelApi.getAll(0, 1000);
      setEnergyLevels(response.data);
    } catch (error) {
      console.error('Error fetching energy levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredLevels = () => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case 'day':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
    }

    return energyLevels.filter(e => new Date(e.recorded_at) >= cutoffDate);
  };

  const getEnergyTrend = () => {
    const filtered = getFilteredLevels()
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .slice(-50);

    return filtered.map(entry => {
      const date = new Date(entry.recorded_at);
      return {
        time: timeRange === 'day'
          ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        energy: entry.energy_score,
        focus: entry.focus_score,
        motivation: entry.motivation_score,
        overall: ((entry.energy_score + entry.focus_score + entry.motivation_score) / 3).toFixed(1),
      };
    });
  };

  const getHourlyPattern = () => {
    const hourlyData: { [key: number]: { energy: number[]; focus: number[]; motivation: number[] } } = {};

    energyLevels.forEach(entry => {
      const hour = new Date(entry.recorded_at).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { energy: [], focus: [], motivation: [] };
      }
      hourlyData[hour].energy.push(entry.energy_score);
      hourlyData[hour].focus.push(entry.focus_score);
      hourlyData[hour].motivation.push(entry.motivation_score);
    });

    return Array.from({ length: 24 }, (_, hour) => {
      const data = hourlyData[hour];
      if (!data || data.energy.length === 0) {
        return { hour: `${hour}:00`, energy: 0, focus: 0, motivation: 0 };
      }

      return {
        hour: `${hour}:00`,
        energy: (data.energy.reduce((a, b) => a + b, 0) / data.energy.length).toFixed(1),
        focus: (data.focus.reduce((a, b) => a + b, 0) / data.focus.length).toFixed(1),
        motivation: (data.motivation.reduce((a, b) => a + b, 0) / data.motivation.length).toFixed(1),
      };
    }).filter(d => parseFloat(d.energy as string) > 0);
  };

  const getDayOfWeekPattern = () => {
    const dayData: { [key: string]: { energy: number[]; focus: number[]; motivation: number[] } } = {
      Sunday: { energy: [], focus: [], motivation: [] },
      Monday: { energy: [], focus: [], motivation: [] },
      Tuesday: { energy: [], focus: [], motivation: [] },
      Wednesday: { energy: [], focus: [], motivation: [] },
      Thursday: { energy: [], focus: [], motivation: [] },
      Friday: { energy: [], focus: [], motivation: [] },
      Saturday: { energy: [], focus: [], motivation: [] },
    };

    energyLevels.forEach(entry => {
      const day = new Date(entry.recorded_at).toLocaleDateString('en-US', { weekday: 'long' });
      dayData[day].energy.push(entry.energy_score);
      dayData[day].focus.push(entry.focus_score);
      dayData[day].motivation.push(entry.motivation_score);
    });

    return Object.entries(dayData).map(([day, scores]) => {
      if (scores.energy.length === 0) {
        return { day: day.slice(0, 3), energy: 0, focus: 0, motivation: 0 };
      }

      return {
        day: day.slice(0, 3),
        energy: (scores.energy.reduce((a, b) => a + b, 0) / scores.energy.length).toFixed(1),
        focus: (scores.focus.reduce((a, b) => a + b, 0) / scores.focus.length).toFixed(1),
        motivation: (scores.motivation.reduce((a, b) => a + b, 0) / scores.motivation.length).toFixed(1),
      };
    });
  };

  const getEnergyRadar = () => {
    const filtered = getFilteredLevels();
    if (filtered.length === 0) return [];

    const avgEnergy = filtered.reduce((sum, e) => sum + e.energy_score, 0) / filtered.length;
    const avgFocus = filtered.reduce((sum, e) => sum + e.focus_score, 0) / filtered.length;
    const avgMotivation = filtered.reduce((sum, e) => sum + e.motivation_score, 0) / filtered.length;

    const morning = filtered.filter(e => {
      const hour = new Date(e.recorded_at).getHours();
      return hour >= 6 && hour < 12;
    });
    const afternoon = filtered.filter(e => {
      const hour = new Date(e.recorded_at).getHours();
      return hour >= 12 && hour < 17;
    });
    const evening = filtered.filter(e => {
      const hour = new Date(e.recorded_at).getHours();
      return hour >= 17;
    });

    return [
      {
        metric: 'Energy',
        score: avgEnergy,
        fullMark: 10,
      },
      {
        metric: 'Focus',
        score: avgFocus,
        fullMark: 10,
      },
      {
        metric: 'Motivation',
        score: avgMotivation,
        fullMark: 10,
      },
      {
        metric: 'Morning',
        score: morning.length > 0 ? morning.reduce((sum, e) => sum + e.energy_score, 0) / morning.length : 0,
        fullMark: 10,
      },
      {
        metric: 'Afternoon',
        score: afternoon.length > 0 ? afternoon.reduce((sum, e) => sum + e.energy_score, 0) / afternoon.length : 0,
        fullMark: 10,
      },
      {
        metric: 'Evening',
        score: evening.length > 0 ? evening.reduce((sum, e) => sum + e.energy_score, 0) / evening.length : 0,
        fullMark: 10,
      },
    ];
  };

  const getStats = () => {
    const filtered = getFilteredLevels();
    if (filtered.length === 0) {
      return {
        avgEnergy: 0,
        avgFocus: 0,
        avgMotivation: 0,
        peakHour: 'N/A',
        lowHour: 'N/A',
      };
    }

    const avgEnergy = (filtered.reduce((sum, e) => sum + e.energy_score, 0) / filtered.length).toFixed(1);
    const avgFocus = (filtered.reduce((sum, e) => sum + e.focus_score, 0) / filtered.length).toFixed(1);
    const avgMotivation = (filtered.reduce((sum, e) => sum + e.motivation_score, 0) / filtered.length).toFixed(1);

    const hourlyPattern = getHourlyPattern();
    if (hourlyPattern.length === 0) {
      return { avgEnergy, avgFocus, avgMotivation, peakHour: 'N/A', lowHour: 'N/A' };
    }

    const sortedByEnergy = [...hourlyPattern].sort((a, b) => parseFloat(b.energy as string) - parseFloat(a.energy as string));
    const peakHour = sortedByEnergy[0]?.hour || 'N/A';
    const lowHour = sortedByEnergy[sortedByEnergy.length - 1]?.hour || 'N/A';

    return {
      avgEnergy,
      avgFocus,
      avgMotivation,
      peakHour,
      lowHour,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading energy patterns...</div>
      </div>
    );
  }

  const stats = getStats();
  const energyTrend = getEnergyTrend();
  const hourlyPattern = getHourlyPattern();
  const dayOfWeekPattern = getDayOfWeekPattern();
  const energyRadar = getEnergyRadar();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Energy Patterns</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'day'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Avg Energy</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.avgEnergy}/10</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Avg Focus</div>
          <div className="text-2xl font-bold text-blue-600">{stats.avgFocus}/10</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Avg Motivation</div>
          <div className="text-2xl font-bold text-purple-600">{stats.avgMotivation}/10</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Peak Hour</div>
          <div className="text-2xl font-bold text-green-600">{stats.peakHour}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Low Hour</div>
          <div className="text-2xl font-bold text-red-600">{stats.lowHour}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Energy Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={energyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="energy" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Energy" />
            <Area type="monotone" dataKey="focus" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Focus" />
            <Area type="monotone" dataKey="motivation" stackId="3" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Motivation" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hourly Energy Pattern</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyPattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energy" />
              <Line type="monotone" dataKey="focus" stroke="#3b82f6" strokeWidth={2} name="Focus" />
              <Line type="monotone" dataKey="motivation" stroke="#8b5cf6" strokeWidth={2} name="Motivation" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Day of Week Pattern</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dayOfWeekPattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energy" />
              <Line type="monotone" dataKey="focus" stroke="#3b82f6" strokeWidth={2} name="Focus" />
              <Line type="monotone" dataKey="motivation" stroke="#8b5cf6" strokeWidth={2} name="Motivation" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Energy Profile</h2>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={energyRadar}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 10]} />
            <Radar name="Score" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Energy Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-2">Best Time</div>
            <div className="text-lg text-gray-700">
              Schedule important tasks during your peak hours: <span className="font-bold text-green-600">{stats.peakHour}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-2">Low Energy</div>
            <div className="text-lg text-gray-700">
              Take breaks or do lighter tasks around: <span className="font-bold text-red-600">{stats.lowHour}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-2">Overall</div>
            <div className="text-lg text-gray-700">
              Your average energy level is{' '}
              <span className={`font-bold ${parseFloat(stats.avgEnergy as string) >= 7 ? 'text-green-600' : parseFloat(stats.avgEnergy as string) >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                {parseFloat(stats.avgEnergy as string) >= 7 ? 'strong' : parseFloat(stats.avgEnergy as string) >= 5 ? 'moderate' : 'low'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyPatternChart;
