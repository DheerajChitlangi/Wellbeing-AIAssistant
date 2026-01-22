import React, { useState, useEffect } from 'react';
import { moodApi } from '../services/api';
import type { MoodEntry } from '../types';

const Mood: React.FC = () => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    mood_score: 5,
    energy_level: 5,
    stress_level: 5,
    notes: '',
  });

  useEffect(() => {
    fetchMoodEntries();
  }, []);

  const fetchMoodEntries = async () => {
    try {
      const response = await moodApi.getAll();
      setMoodEntries(response.data);
    } catch (err) {
      console.error('Error fetching mood entries:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await moodApi.create(formData);
      setSuccess('Mood entry added successfully!');
      setFormData({
        mood_score: 5,
        energy_level: 5,
        stress_level: 5,
        notes: '',
      });
      fetchMoodEntries();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add mood entry');
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (score: number) => {
    if (score <= 2) return '😢';
    if (score <= 4) return '😕';
    if (score <= 6) return '😐';
    if (score <= 8) return '🙂';
    return '😄';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mood Tracking</h1>

      {/* Add Mood Entry Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Log Your Mood</h2>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mood Score: {formData.mood_score} {getMoodEmoji(formData.mood_score)}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.mood_score}
              onChange={(e) => setFormData({ ...formData, mood_score: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Very Low (1)</span>
              <span>Very High (10)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Energy Level: {formData.energy_level}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.energy_level}
              onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Exhausted (1)</span>
              <span>Energized (10)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stress Level: {formData.stress_level}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.stress_level}
              onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Relaxed (1)</span>
              <span>Stressed (10)</span>
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
              placeholder="How are you feeling? What's on your mind?"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Mood Entry'}
          </button>
        </form>
      </div>

      {/* Mood History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Mood History</h2>

        {moodEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No mood entries yet. Start tracking your mood!</p>
        ) : (
          <div className="space-y-4">
            {moodEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getMoodEmoji(entry.mood_score)}</span>
                    <span className="font-medium text-gray-900">Mood: {entry.mood_score}/10</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.created_at!).toLocaleDateString()} at{' '}
                    {new Date(entry.created_at!).toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Energy:</span>{' '}
                    <span className="font-medium">{entry.energy_level}/10</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Stress:</span>{' '}
                    <span className="font-medium">{entry.stress_level}/10</span>
                  </div>
                </div>
                {entry.notes && (
                  <p className="mt-2 text-gray-700 text-sm">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mood;
