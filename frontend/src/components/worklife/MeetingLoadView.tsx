import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { meetingApi } from '../../services/api';
import type { Meeting } from '../../types';

const MEETING_TYPE_COLORS = {
  'one-on-one': '#3b82f6',
  'team': '#10b981',
  'all-hands': '#f59e0b',
  'external': '#ef4444',
};

const MeetingLoadView: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await meetingApi.getAll(0, 1000);
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMeetings = () => {
    const now = new Date();
    const cutoffDate = new Date();

    if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else {
      cutoffDate.setMonth(now.getMonth() - 1);
    }

    return meetings.filter(m => new Date(m.start_time) >= cutoffDate);
  };

  const getDailyMeetingLoad = () => {
    const filtered = getFilteredMeetings();
    const dailyData: { [key: string]: { count: number; minutes: number; necessary: number; unnecessary: number } } = {};

    filtered.forEach(meeting => {
      const date = new Date(meeting.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyData[date]) {
        dailyData[date] = { count: 0, minutes: 0, necessary: 0, unnecessary: 0 };
      }

      dailyData[date].count += 1;
      dailyData[date].minutes += meeting.duration_minutes;

      if (meeting.is_necessary) {
        dailyData[date].necessary += meeting.duration_minutes;
      } else {
        dailyData[date].unnecessary += meeting.duration_minutes;
      }
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        ...data,
        hours: (data.minutes / 60).toFixed(1),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getMeetingTypeBreakdown = () => {
    const filtered = getFilteredMeetings();
    const typeData: { [key: string]: number } = {};

    filtered.forEach(meeting => {
      typeData[meeting.meeting_type] = (typeData[meeting.meeting_type] || 0) + meeting.duration_minutes;
    });

    return Object.entries(typeData).map(([name, value]) => ({
      name: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      value,
      hours: (value / 60).toFixed(1),
      color: MEETING_TYPE_COLORS[name as keyof typeof MEETING_TYPE_COLORS],
    }));
  };

  const getMeetingEfficiency = () => {
    const filtered = getFilteredMeetings();
    const necessary = filtered.filter(m => m.is_necessary).reduce((sum, m) => sum + m.duration_minutes, 0);
    const unnecessary = filtered.filter(m => !m.is_necessary).reduce((sum, m) => sum + m.duration_minutes, 0);

    return [
      { name: 'Necessary', value: necessary, color: '#10b981' },
      { name: 'Questionable', value: unnecessary, color: '#ef4444' },
    ].filter(d => d.value > 0);
  };

  const getTimeOfDayDistribution = () => {
    const filtered = getFilteredMeetings();
    const timeData = {
      'Morning (6-12)': 0,
      'Afternoon (12-17)': 0,
      'Evening (17-22)': 0,
    };

    filtered.forEach(meeting => {
      const hour = new Date(meeting.start_time).getHours();
      if (hour >= 6 && hour < 12) timeData['Morning (6-12)'] += meeting.duration_minutes;
      else if (hour >= 12 && hour < 17) timeData['Afternoon (12-17)'] += meeting.duration_minutes;
      else if (hour >= 17 && hour < 22) timeData['Evening (17-22)'] += meeting.duration_minutes;
    });

    return Object.entries(timeData).map(([name, value]) => ({
      name,
      value,
      hours: (value / 60).toFixed(1),
    }));
  };

  const getStats = () => {
    const filtered = getFilteredMeetings();
    const totalMinutes = filtered.reduce((sum, m) => sum + m.duration_minutes, 0);
    const totalAttendees = filtered.reduce((sum, m) => sum + (m.attendees_count || 0), 0);
    const unnecessary = filtered.filter(m => !m.is_necessary).reduce((sum, m) => sum + m.duration_minutes, 0);

    const uniqueDays = new Set(filtered.map(m => new Date(m.start_time).toDateString())).size;

    return {
      totalMeetings: filtered.length,
      totalHours: (totalMinutes / 60).toFixed(1),
      avgPerDay: uniqueDays > 0 ? (totalMinutes / 60 / uniqueDays).toFixed(1) : 0,
      wastedHours: (unnecessary / 60).toFixed(1),
      wastedPercent: totalMinutes > 0 ? ((unnecessary / totalMinutes) * 100).toFixed(0) : 0,
      avgAttendees: filtered.length > 0 ? (totalAttendees / filtered.length).toFixed(1) : 0,
    };
  };

  const getInsights = () => {
    const stats = getStats();
    const insights: string[] = [];

    if (parseInt(stats.wastedPercent as string) > 30) {
      insights.push('⚠️ High percentage of unnecessary meetings detected');
    }

    if (parseFloat(stats.avgPerDay as string) > 4) {
      insights.push('⚠️ Meeting load is above recommended 4 hours per day');
    }

    const eveningMeetings = getFilteredMeetings().filter(m => {
      const hour = new Date(m.start_time).getHours();
      return hour >= 17;
    });

    if (eveningMeetings.length > 5) {
      insights.push('⚠️ Frequent after-hours meetings detected');
    }

    if (parseFloat(stats.avgAttendees as string) > 8) {
      insights.push('💡 Consider smaller, more focused meetings');
    }

    if (insights.length === 0) {
      insights.push('✅ Meeting load is healthy and well-managed');
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading meeting data...</div>
      </div>
    );
  }

  const stats = getStats();
  const dailyMeetingLoad = getDailyMeetingLoad();
  const meetingTypeBreakdown = getMeetingTypeBreakdown();
  const meetingEfficiency = getMeetingEfficiency();
  const timeOfDayDistribution = getTimeOfDayDistribution();
  const insights = getInsights();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Meeting Load Analysis</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Meetings</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalMeetings}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Hours</div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalHours}h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Avg per Day</div>
          <div className={`text-2xl font-bold ${parseFloat(stats.avgPerDay as string) > 4 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.avgPerDay}h
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Wasted Time</div>
          <div className={`text-2xl font-bold ${parseInt(stats.wastedPercent as string) > 30 ? 'text-red-600' : 'text-orange-600'}`}>
            {stats.wastedPercent}%
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Insights & Recommendations</h2>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="bg-white rounded-lg p-3 text-gray-700">
              {insight}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Meeting Load</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyMeetingLoad}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Meetings" />
              <Bar dataKey="minutes" fill="#8b5cf6" name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Meeting Types</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={meetingTypeBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, hours }) => `${name}: ${hours}h`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {meetingTypeBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${(value / 60).toFixed(1)}h`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Meeting Efficiency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={meetingEfficiency}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${(value / 60).toFixed(1)}h`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {meetingEfficiency.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${(value / 60).toFixed(1)}h`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Time of Day Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeOfDayDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `${(value / 60).toFixed(1)}h`} />
              <Bar dataKey="value" fill="#f59e0b" name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Meeting Hours Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyMeetingLoad}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="necessary" stroke="#10b981" strokeWidth={2} name="Necessary (min)" />
            <Line type="monotone" dataKey="unnecessary" stroke="#ef4444" strokeWidth={2} name="Questionable (min)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MeetingLoadView;
