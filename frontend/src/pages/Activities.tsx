import React, { useState, useEffect } from 'react';
import { activityApi } from '../services/api';
import type { Activity } from '../types';

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    activity_type: '',
    duration_minutes: 30,
    intensity: 'medium',
    notes: '',
  });

  const activityTypes = [
    'Running',
    'Walking',
    'Cycling',
    'Swimming',
    'Gym',
    'Yoga',
    'Sports',
    'Dance',
    'Hiking',
    'Other',
  ];

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await activityApi.getAll();
      setActivities(response.data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.activity_type) {
      setError('Please select an activity type');
      setLoading(false);
      return;
    }

    try {
      await activityApi.create(formData);
      setSuccess('Activity logged successfully!');
      setFormData({
        activity_type: '',
        duration_minutes: 30,
        intensity: 'medium',
        notes: '',
      });
      fetchActivities();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Activity Tracking</h1>

      {/* Add Activity Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Log Activity</h2>

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
              Activity Type *
            </label>
            <select
              value={formData.activity_type}
              onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an activity</option>
              {activityTypes.map((type) => (
                <option key={type} value={type.toLowerCase()}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration: {formData.duration_minutes} minutes
            </label>
            <input
              type="range"
              min="5"
              max="180"
              step="5"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 min</span>
              <span>180 min</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intensity
            </label>
            <div className="flex space-x-4">
              {['low', 'medium', 'high'].map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="intensity"
                    value={level}
                    checked={formData.intensity === level}
                    onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                    className="mr-2"
                  />
                  <span className="capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="How did it go? Any achievements or observations?"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Log Activity'}
          </button>
        </form>
      </div>

      {/* Activity History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Activity History</h2>

        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No activities logged yet. Start tracking your activities!</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 capitalize text-lg">
                      {activity.activity_type}
                    </h3>
                    <p className="text-sm text-gray-600">{activity.duration_minutes} minutes</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {new Date(activity.created_at!).toLocaleDateString()}
                    </span>
                    {activity.intensity && (
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getIntensityColor(activity.intensity)}`}>
                          {activity.intensity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {activity.notes && (
                  <p className="mt-2 text-gray-700 text-sm">{activity.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
