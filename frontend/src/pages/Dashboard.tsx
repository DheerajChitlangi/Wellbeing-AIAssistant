import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { moodApi, sleepApi, activityApi, goalApi } from '../services/api';
import type { MoodEntry, SleepEntry, Activity, Goal } from '../types';

interface WellbeingCard {
  title: string;
  icon: string;
  link: string;
  gradient: string;
  description: string;
  stat?: string;
  statLabel?: string;
}

const Dashboard: React.FC = () => {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [sleepData, setSleepData] = useState<SleepEntry[]>([]);
  const [activityData, setActivityData] = useState<Activity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moodRes, sleepRes, activityRes, goalsRes] = await Promise.all([
          moodApi.getAll(0, 30).catch(() => ({ data: [] })),
          sleepApi.getAll(0, 30).catch(() => ({ data: [] })),
          activityApi.getAll(0, 30).catch(() => ({ data: [] })),
          goalApi.getAll().catch(() => ({ data: [] })),
        ]);
        setMoodData(moodRes.data);
        setSleepData(sleepRes.data);
        setActivityData(activityRes.data);
        setGoals(goalsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatChartData = () => {
    return moodData.slice(0, 7).reverse().map((entry) => ({
      date: new Date(entry.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry.mood_score,
      energy: entry.energy_level,
      stress: entry.stress_level,
    }));
  };

  const stats = {
    totalActivities: activityData.length,
    avgSleepHours: sleepData.length > 0
      ? (sleepData.reduce((sum, entry) => sum + entry.sleep_hours, 0) / sleepData.length).toFixed(1)
      : '0',
    avgMood: moodData.length > 0
      ? (moodData.reduce((sum, entry) => sum + entry.mood_score, 0) / moodData.length).toFixed(1)
      : '0',
    activeGoals: goals.filter(g => g.is_completed === 0).length,
  };

  const wellbeingCards: WellbeingCard[] = [
    {
      title: 'Mood',
      icon: '😊',
      link: '/mood',
      gradient: 'from-purple-400 to-pink-500',
      description: 'Track your emotional wellbeing',
      stat: `${stats.avgMood}/10`,
      statLabel: 'Avg Mood',
    },
    {
      title: 'Sleep',
      icon: '😴',
      link: '/sleep',
      gradient: 'from-blue-400 to-cyan-500',
      description: 'Monitor your sleep patterns',
      stat: `${stats.avgSleepHours}h`,
      statLabel: 'Avg Sleep',
    },
    {
      title: 'Activities',
      icon: '🏃',
      link: '/activities',
      gradient: 'from-green-400 to-emerald-500',
      description: 'Log your physical activities',
      stat: stats.totalActivities.toString(),
      statLabel: 'Total Activities',
    },
    {
      title: 'Goals',
      icon: '🎯',
      link: '/goals',
      gradient: 'from-orange-400 to-red-500',
      description: 'Manage your wellbeing goals',
      stat: stats.activeGoals.toString(),
      statLabel: 'Active Goals',
    },
    {
      title: 'Financial',
      icon: '💰',
      link: '/financial',
      gradient: 'from-yellow-400 to-amber-500',
      description: 'Track your financial health',
    },
    {
      title: 'Work-Life',
      icon: '⚖️',
      link: '/worklife',
      gradient: 'from-indigo-400 to-purple-500',
      description: 'Balance work and personal life',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-lg text-gray-600">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your Wellbeing Dashboard
          </h1>
          <p className="text-gray-600">Monitor and improve all aspects of your wellbeing</p>
        </div>

        {/* Wellbeing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {wellbeingCards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

              {/* Card Content */}
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-5xl transform group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${card.gradient} text-white text-xs font-semibold`}>
                    Track
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{card.description}</p>

                {card.stat && (
                  <div className={`bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                    <div className="text-3xl font-bold">{card.stat}</div>
                    <div className="text-sm opacity-70">{card.statLabel}</div>
                  </div>
                )}

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 text-gray-400 group-hover:text-gray-600 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Section */}
        {moodData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📈</span>
              Weekly Trends
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={formatChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis domain={[0, 10]} stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Mood"
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Energy"
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  name="Stress"
                  dot={{ fill: '#f59e0b', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-1">Mood Entries</div>
            <div className="text-3xl font-bold">{moodData.length}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-1">Sleep Logs</div>
            <div className="text-3xl font-bold">{sleepData.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-1">Activities</div>
            <div className="text-3xl font-bold">{activityData.length}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-1">Total Goals</div>
            <div className="text-3xl font-bold">{goals.length}</div>
          </div>
        </div>

        {/* Empty State */}
        {moodData.length === 0 && sleepData.length === 0 && activityData.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center mt-8">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Wellbeing Journey</h3>
            <p className="text-gray-600 mb-6">Track your mood, sleep, and activities to see insights here!</p>
            <div className="flex justify-center gap-4">
              <Link
                to="/mood"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                Log Mood
              </Link>
              <Link
                to="/sleep"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                Log Sleep
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
