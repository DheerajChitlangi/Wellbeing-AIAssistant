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
  LineChart,
  Line,
} from 'recharts';
import { workSessionApi } from '../../services/api';
import type { WorkSession } from '../../types';

const WorkHoursCalendar: React.FC = () => {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await workSessionApi.getAll(0, 1000);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching work sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCalendarData = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const calendar: {
      date: Date;
      sessions: WorkSession[];
      totalMinutes: number;
      workMinutes: number;
      meetingMinutes: number;
    }[] = [];

    for (let i = 0; i < firstDay; i++) {
      const date = new Date(year, month, -(firstDay - i - 1));
      calendar.push({
        date,
        sessions: [],
        totalMinutes: 0,
        workMinutes: 0,
        meetingMinutes: 0,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.start_time);
        return (
          sessionDate.getDate() === day &&
          sessionDate.getMonth() === month &&
          sessionDate.getFullYear() === year
        );
      });

      const workMinutes = daySessions
        .filter(s => s.session_type === 'work' || s.session_type === 'focus')
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

      const meetingMinutes = daySessions
        .filter(s => s.session_type === 'meeting')
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

      calendar.push({
        date,
        sessions: daySessions,
        totalMinutes: daySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
        workMinutes,
        meetingMinutes,
      });
    }

    return calendar;
  };

  const getHeatmapColor = (minutes: number) => {
    if (minutes === 0) return 'bg-gray-100';
    if (minutes < 120) return 'bg-blue-200';
    if (minutes < 240) return 'bg-blue-300';
    if (minutes < 360) return 'bg-blue-400';
    if (minutes < 480) return 'bg-blue-600';
    if (minutes < 600) return 'bg-orange-500';
    return 'bg-red-600';
  };

  const getDayOfWeekBreakdown = () => {
    const last30Days = sessions.filter(s => {
      const daysAgo = (Date.now() - new Date(s.start_time).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    const dayData: { [key: string]: number } = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    last30Days.forEach(session => {
      const day = new Date(session.start_time).toLocaleDateString('en-US', { weekday: 'long' });
      dayData[day] += session.duration_minutes || 0;
    });

    return Object.entries(dayData).map(([day, minutes]) => ({
      day: day.slice(0, 3),
      hours: (minutes / 60).toFixed(1),
      minutes,
    }));
  };

  const getWeeklyTrend = () => {
    const last12Weeks: { [key: string]: number } = {};

    sessions.forEach(session => {
      const date = new Date(session.start_time);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!last12Weeks[weekKey]) {
        last12Weeks[weekKey] = 0;
      }
      last12Weeks[weekKey] += session.duration_minutes || 0;
    });

    return Object.entries(last12Weeks)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([week, minutes]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: (minutes / 60).toFixed(1),
      }));
  };

  const getStats = () => {
    const last30Days = sessions.filter(s => {
      const daysAgo = (Date.now() - new Date(s.start_time).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    const totalMinutes = last30Days.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const workDays = new Set(
      last30Days
        .map(s => new Date(s.start_time).toDateString())
    ).size;

    const thisWeek = sessions.filter(s => {
      const daysAgo = (Date.now() - new Date(s.start_time).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    const thisWeekMinutes = thisWeek.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

    const afterHours = last30Days.filter(s => {
      const hour = new Date(s.start_time).getHours();
      return hour < 8 || hour >= 18;
    }).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      avgPerDay: workDays > 0 ? (totalMinutes / 60 / workDays).toFixed(1) : 0,
      thisWeekHours: (thisWeekMinutes / 60).toFixed(1),
      afterHoursPercent: totalMinutes > 0 ? ((afterHours / totalMinutes) * 100).toFixed(0) : 0,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading work hours data...</div>
      </div>
    );
  }

  const calendarData = getCalendarData();
  const dayOfWeekBreakdown = getDayOfWeekBreakdown();
  const weeklyTrend = getWeeklyTrend();
  const stats = getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Work Hours Calendar</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Last 30 Days</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalHours}h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Avg per Day</div>
          <div className="text-2xl font-bold text-green-600">{stats.avgPerDay}h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">This Week</div>
          <div className="text-2xl font-bold text-purple-600">{stats.thisWeekHours}h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">After Hours</div>
          <div className={`text-2xl font-bold ${parseInt(stats.afterHoursPercent as string) > 20 ? 'text-red-600' : 'text-orange-600'}`}>
            {stats.afterHoursPercent}%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Work Hours Heatmap</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ←
            </button>
            <span className="px-4 py-1 font-medium">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 pb-2">
              {day}
            </div>
          ))}
          {calendarData.map((day, idx) => (
            <div
              key={idx}
              className={`aspect-square p-2 rounded-lg ${getHeatmapColor(day.totalMinutes)} ${
                day.date.getMonth() !== selectedMonth.getMonth() ? 'opacity-30' : ''
              } hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer`}
              title={`${day.date.toLocaleDateString()}: ${(day.totalMinutes / 60).toFixed(1)}h`}
            >
              <div className="text-sm font-medium">{day.date.getDate()}</div>
              {day.totalMinutes > 0 && (
                <div className="text-xs mt-1">
                  <div>{(day.totalMinutes / 60).toFixed(1)}h</div>
                  {day.totalMinutes > 480 && (
                    <div className="text-xs text-red-700 font-bold">⚠️</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <div className="w-4 h-4 bg-blue-200 rounded"></div>
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <div className="w-4 h-4 bg-red-600 rounded"></div>
          </div>
          <span>More (10+ hours/day)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hours by Day of Week</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayOfWeekBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `${value} hours`} />
              <Legend />
              <Bar dataKey="hours" fill="#3b82f6" name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `${value} hours`} />
              <Legend />
              <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={3} name="Hours/Week" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WorkHoursCalendar;
