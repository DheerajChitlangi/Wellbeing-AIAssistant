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
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { exerciseApi } from '../../services/api';
import type { Exercise } from '../../types';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const INTENSITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const ExerciseLog: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await exerciseApi.getAll(0, 1000);
      setExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
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
      exercises: Exercise[];
      totalMinutes: number;
      totalCalories: number;
    }[] = [];

    for (let i = 0; i < firstDay; i++) {
      const date = new Date(year, month, -(firstDay - i - 1));
      calendar.push({
        date,
        exercises: [],
        totalMinutes: 0,
        totalCalories: 0,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayExercises = exercises.filter(e => {
        const exerciseDate = new Date(e.performed_at);
        return (
          exerciseDate.getDate() === day &&
          exerciseDate.getMonth() === month &&
          exerciseDate.getFullYear() === year
        );
      });

      calendar.push({
        date,
        exercises: dayExercises,
        totalMinutes: dayExercises.reduce((sum, e) => sum + e.duration_minutes, 0),
        totalCalories: dayExercises.reduce((sum, e) => sum + (e.calories_burned || 0), 0),
      });
    }

    return calendar;
  };

  const getWeeklyStats = () => {
    const last30Days = exercises.filter(e => {
      const daysAgo = (Date.now() - new Date(e.performed_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    const weeklyData: { [key: string]: { minutes: number; calories: number; count: number } } = {};

    last30Days.forEach(exercise => {
      const date = new Date(exercise.performed_at);
      const week = `Week ${Math.floor((30 - (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)) / 7) + 1}`;

      if (!weeklyData[week]) {
        weeklyData[week] = { minutes: 0, calories: 0, count: 0 };
      }

      weeklyData[week].minutes += exercise.duration_minutes;
      weeklyData[week].calories += exercise.calories_burned || 0;
      weeklyData[week].count += 1;
    });

    return Object.entries(weeklyData).map(([week, data]) => ({
      week,
      ...data,
    }));
  };

  const getExerciseTypeBreakdown = () => {
    const last30Days = exercises.filter(e => {
      const daysAgo = (Date.now() - new Date(e.performed_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    const typeData: { [key: string]: number } = {};

    last30Days.forEach(exercise => {
      typeData[exercise.exercise_type] = (typeData[exercise.exercise_type] || 0) + exercise.duration_minutes;
    });

    return Object.entries(typeData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getIntensityBreakdown = () => {
    const last30Days = exercises.filter(e => {
      const daysAgo = (Date.now() - new Date(e.performed_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    const intensityData: { [key: string]: number } = {};

    last30Days.forEach(exercise => {
      intensityData[exercise.intensity] = (intensityData[exercise.intensity] || 0) + exercise.duration_minutes;
    });

    return Object.entries(intensityData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: INTENSITY_COLORS[name as keyof typeof INTENSITY_COLORS],
    }));
  };

  const getStats = () => {
    const last30Days = exercises.filter(e => {
      const daysAgo = (Date.now() - new Date(e.performed_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    const totalMinutes = last30Days.reduce((sum, e) => sum + e.duration_minutes, 0);
    const totalCalories = last30Days.reduce((sum, e) => sum + (e.calories_burned || 0), 0);
    const activeDays = new Set(last30Days.map(e => new Date(e.performed_at).toDateString())).size;

    return {
      totalWorkouts: last30Days.length,
      totalMinutes,
      totalCalories,
      activeDays,
      avgMinutesPerDay: activeDays > 0 ? totalMinutes / activeDays : 0,
    };
  };

  const getIntensityColor = (minutes: number) => {
    if (minutes === 0) return 'bg-gray-100';
    if (minutes < 20) return 'bg-green-200';
    if (minutes < 40) return 'bg-green-400';
    if (minutes < 60) return 'bg-green-600';
    return 'bg-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading exercise data...</div>
      </div>
    );
  }

  const calendarData = getCalendarData();
  const weeklyStats = getWeeklyStats();
  const exerciseTypeBreakdown = getExerciseTypeBreakdown();
  const intensityBreakdown = getIntensityBreakdown();
  const stats = getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Exercise Log</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Workouts</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalWorkouts}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Minutes</div>
          <div className="text-2xl font-bold text-green-600">{stats.totalMinutes}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Calories Burned</div>
          <div className="text-2xl font-bold text-orange-600">{stats.totalCalories}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Active Days</div>
          <div className="text-2xl font-bold text-purple-600">{stats.activeDays}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Avg/Day</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.avgMinutesPerDay.toFixed(0)} min
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Activity Calendar</h2>
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
              className={`aspect-square p-2 rounded-lg ${getIntensityColor(day.totalMinutes)} ${
                day.date.getMonth() !== selectedMonth.getMonth() ? 'opacity-30' : ''
              }`}
            >
              <div className="text-sm font-medium">{day.date.getDate()}</div>
              {day.totalMinutes > 0 && (
                <div className="text-xs mt-1">
                  <div>{day.totalMinutes}m</div>
                  {day.exercises.length > 0 && (
                    <div className="text-xs opacity-75">{day.exercises.length} workout{day.exercises.length > 1 ? 's' : ''}</div>
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
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <div className="w-4 h-4 bg-green-800 rounded"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="minutes" fill="#10b981" name="Minutes" />
              <Bar dataKey="count" fill="#3b82f6" name="Workouts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Exercise Types</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={exerciseTypeBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {exerciseTypeBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} min`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Intensity Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={intensityBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value} min`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {intensityBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} min`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Calories Burned</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="calories" stroke="#f59e0b" strokeWidth={3} name="Calories" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLog;
