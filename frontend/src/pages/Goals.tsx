import React, { useState, useEffect } from 'react';
import { goalApi } from '../services/api';
import type { Goal } from '../types';

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await goalApi.getAll();
      setGoals(response.data);
    } catch (err) {
      console.error('Error fetching goals:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.title.trim()) {
      setError('Please enter a goal title');
      setLoading(false);
      return;
    }

    try {
      const submitData: any = {
        title: formData.title,
        description: formData.description || undefined,
        target_date: formData.target_date ? new Date(formData.target_date).toISOString() : undefined,
      };

      await goalApi.create(submitData);
      setSuccess('Goal created successfully!');
      setFormData({
        title: '',
        description: '',
        target_date: '',
      });
      fetchGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (goal: Goal) => {
    try {
      await goalApi.update(goal.id!, {
        is_completed: goal.is_completed === 1 ? 0 : 1,
      });
      fetchGoals();
    } catch (err) {
      console.error('Error updating goal:', err);
    }
  };

  const handleDelete = async (goalId: number) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalApi.delete(goalId);
        setSuccess('Goal deleted successfully!');
        fetchGoals();
      } catch (err) {
        setError('Failed to delete goal');
      }
    }
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Goals</h1>

      {/* Add Goal Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Goal</h2>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Exercise 3 times per week"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add more details about your goal..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Goal'}
          </button>
        </form>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Goals</h2>
          <div className="text-sm text-gray-600">
            {goals.filter((g) => g.is_completed === 0).length} active ·{' '}
            {goals.filter((g) => g.is_completed === 1).length} completed
          </div>
        </div>

        {goals.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No goals yet. Create your first goal!</p>
        ) : (
          <div className="space-y-4">
            {/* Active Goals */}
            {goals.filter((g) => g.is_completed === 0).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Active Goals</h3>
                {goals
                  .filter((g) => g.is_completed === 0)
                  .map((goal) => (
                    <div
                      key={goal.id}
                      className="border border-gray-200 rounded-lg p-4 mb-2 hover:bg-gray-50"
                    >
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={goal.is_completed === 1}
                          onChange={() => handleToggleComplete(goal)}
                          className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-lg">{goal.title}</h3>
                          {goal.description && (
                            <p className="text-gray-600 text-sm mt-1">{goal.description}</p>
                          )}
                          {goal.target_date && (
                            <div className="mt-2 flex items-center text-sm">
                              <span className="text-gray-500">Target:</span>
                              <span className="ml-2 font-medium">
                                {new Date(goal.target_date).toLocaleDateString()}
                              </span>
                              {getDaysRemaining(goal.target_date) >= 0 ? (
                                <span className="ml-2 text-blue-600">
                                  ({getDaysRemaining(goal.target_date)} days left)
                                </span>
                              ) : (
                                <span className="ml-2 text-red-600">(Overdue)</span>
                              )}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-400">
                            Created {new Date(goal.created_at!).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(goal.id!)}
                          className="ml-4 text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Completed Goals */}
            {goals.filter((g) => g.is_completed === 1).length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Completed Goals</h3>
                {goals
                  .filter((g) => g.is_completed === 1)
                  .map((goal) => (
                    <div
                      key={goal.id}
                      className="border border-gray-200 rounded-lg p-4 mb-2 bg-green-50"
                    >
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={goal.is_completed === 1}
                          onChange={() => handleToggleComplete(goal)}
                          className="mt-1 mr-3 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-700 text-lg line-through">
                            {goal.title}
                          </h3>
                          {goal.description && (
                            <p className="text-gray-500 text-sm mt-1">{goal.description}</p>
                          )}
                          <div className="mt-2 text-xs text-gray-400">
                            Completed on {new Date(goal.updated_at || goal.created_at!).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(goal.id!)}
                          className="ml-4 text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
