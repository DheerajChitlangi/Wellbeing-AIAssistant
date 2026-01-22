import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
} from 'recharts';
import { mealApi } from '../../services/api';
import type { Meal } from '../../types';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
const MACRO_COLORS = {
  protein: '#3b82f6',
  carbs: '#f59e0b',
  fats: '#ef4444',
};

const NutritionDashboard: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week'>('day');

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await mealApi.getAll(0, 1000);
      setMeals(response.data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMeals = () => {
    const now = new Date();
    const cutoffDate = new Date();

    if (timeRange === 'day') {
      cutoffDate.setHours(0, 0, 0, 0);
    } else {
      cutoffDate.setDate(now.getDate() - 7);
    }

    return meals.filter(m => new Date(m.meal_time) >= cutoffDate);
  };

  const getDailyNutrition = () => {
    const filtered = getFilteredMeals();
    const dailyData: { [key: string]: { calories: number; protein: number; carbs: number; fats: number; count: number } } = {};

    filtered.forEach(meal => {
      const date = new Date(meal.meal_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyData[date]) {
        dailyData[date] = { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 };
      }

      dailyData[date].calories += meal.calories || 0;
      dailyData[date].protein += meal.protein || 0;
      dailyData[date].carbs += meal.carbs || 0;
      dailyData[date].fats += meal.fats || 0;
      dailyData[date].count += 1;
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getMealTypeDistribution = () => {
    const filtered = getFilteredMeals();
    const distribution: { [key: string]: number } = {};

    filtered.forEach(meal => {
      distribution[meal.meal_type] = (distribution[meal.meal_type] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  };

  const getMacroBreakdown = () => {
    const filtered = getFilteredMeals();
    const totalProtein = filtered.reduce((sum, m) => sum + (m.protein || 0), 0);
    const totalCarbs = filtered.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const totalFats = filtered.reduce((sum, m) => sum + (m.fats || 0), 0);

    return [
      { name: 'Protein', value: totalProtein, color: MACRO_COLORS.protein },
      { name: 'Carbs', value: totalCarbs, color: MACRO_COLORS.carbs },
      { name: 'Fats', value: totalFats, color: MACRO_COLORS.fats },
    ];
  };

  const getNutritionScore = () => {
    const filtered = getFilteredMeals();
    if (filtered.length === 0) return [];

    const avgCalories = filtered.reduce((sum, m) => sum + (m.calories || 0), 0) / filtered.length;
    const avgProtein = filtered.reduce((sum, m) => sum + (m.protein || 0), 0) / filtered.length;
    const avgCarbs = filtered.reduce((sum, m) => sum + (m.carbs || 0), 0) / filtered.length;
    const avgFats = filtered.reduce((sum, m) => sum + (m.fats || 0), 0) / filtered.length;

    const caloriesScore = Math.min((avgCalories / 600) * 100, 100);
    const proteinScore = Math.min((avgProtein / 30) * 100, 100);
    const carbsScore = Math.min((avgCarbs / 60) * 100, 100);
    const fatsScore = Math.min((avgFats / 20) * 100, 100);

    return [
      { subject: 'Calories', score: caloriesScore, fullMark: 100 },
      { subject: 'Protein', score: proteinScore, fullMark: 100 },
      { subject: 'Carbs', score: carbsScore, fullMark: 100 },
      { subject: 'Fats', score: fatsScore, fullMark: 100 },
      { subject: 'Balance', score: (proteinScore + carbsScore + fatsScore) / 3, fullMark: 100 },
    ];
  };

  const getStats = () => {
    const filtered = getFilteredMeals();
    const totalCalories = filtered.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalProtein = filtered.reduce((sum, m) => sum + (m.protein || 0), 0);
    const totalCarbs = filtered.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const totalFats = filtered.reduce((sum, m) => sum + (m.fats || 0), 0);

    return {
      totalMeals: filtered.length,
      totalCalories,
      avgCalories: filtered.length > 0 ? totalCalories / filtered.length : 0,
      totalProtein,
      totalCarbs,
      totalFats,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading nutrition data...</div>
      </div>
    );
  }

  const stats = getStats();
  const dailyNutrition = getDailyNutrition();
  const mealTypeDistribution = getMealTypeDistribution();
  const macroBreakdown = getMacroBreakdown();
  const nutritionScore = getNutritionScore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Nutrition Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'day'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Meals</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalMeals}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Calories</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.totalCalories.toFixed(0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Avg per Meal</div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.avgCalories.toFixed(0)} cal
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Protein</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalProtein.toFixed(1)}g
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Calories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyNutrition}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="calories" fill="#10b981" name="Calories" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Macronutrient Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={macroBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}g`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {macroBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}g`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Macros Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyNutrition}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="protein" stroke={MACRO_COLORS.protein} strokeWidth={2} name="Protein (g)" />
              <Line type="monotone" dataKey="carbs" stroke={MACRO_COLORS.carbs} strokeWidth={2} name="Carbs (g)" />
              <Line type="monotone" dataKey="fats" stroke={MACRO_COLORS.fats} strokeWidth={2} name="Fats (g)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Meal Type Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mealTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mealTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nutrition Balance Score</h2>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={nutritionScore}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NutritionDashboard;
