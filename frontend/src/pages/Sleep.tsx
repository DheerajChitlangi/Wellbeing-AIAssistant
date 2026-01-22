import React, { useState, useEffect } from 'react';
import { sleepApi } from '../services/api';
import type { SleepEntry } from '../types';

const Sleep: React.FC = () => {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    sleep_hours: 7,
    sleep_quality: 5,
    bedtime: '',
    wake_time: '',
    notes: '',
  });

  useEffect(() => {
    fetchSleepEntries();
  }, []);

  const fetchSleepEntries = async () => {
    try {
      const response = await sleepApi.getAll();
      setSleepEntries(response.data);
    } catch (err) {
      console.error('Error fetching sleep entries:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const submitData: any = {
        sleep_hours: formData.sleep_hours,
        sleep_quality: formData.sleep_quality,
        notes: formData.notes || undefined,
      };

      if (formData.bedtime) {
        submitData.bedtime = new Date(formData.bedtime).toISOString();
      }
      if (formData.wake_time) {
        submitData.wake_time = new Date(formData.wake_time).toISOString();
      }

      await sleepApi.create(submitData);
      setSuccess('Sleep entry logged successfully!');
      setFormData({
        sleep_hours: 7,
        sleep_quality: 5,
        bedtime: '',
        wake_time: '',
        notes: '',
      });
      fetchSleepEntries();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to log sleep entry');
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality <= 3) return 'text-red-600';
    if (quality <= 6) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getQualityLabel = (quality: number) => {
    if (quality <= 3) return 'Poor';
    if (quality <= 6) return 'Fair';
    if (quality <= 8) return 'Good';
    return 'Excellent';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Sleep Tracking</h1>

      {/* Add Sleep Entry Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Log Sleep</h2>

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
              Total Sleep Hours: {formData.sleep_hours}h
            </label>
            <input
              type="range"
              min="1"
              max="12"
              step="0.5"
              value={formData.sleep_hours}
              onChange={(e) => setFormData({ ...formData, sleep_hours: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1h</span>
              <span>12h</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Quality: {formData.sleep_quality}/10 ({getQualityLabel(formData.sleep_quality)})
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.sleep_quality}
              onChange={(e) => setFormData({ ...formData, sleep_quality: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor (1)</span>
              <span>Excellent (10)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedtime (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.bedtime}
                onChange={(e) => setFormData({ ...formData, bedtime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wake Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.wake_time}
                onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
              placeholder="How did you sleep? Any dreams or disturbances?"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Log Sleep Entry'}
          </button>
        </form>
      </div>

      {/* Sleep History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Sleep History</h2>

        {sleepEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No sleep entries yet. Start tracking your sleep!</p>
        ) : (
          <div className="space-y-4">
            {sleepEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 text-lg">
                      {entry.sleep_hours}h of sleep
                    </h3>
                    <p className={`text-sm font-medium ${getQualityColor(entry.sleep_quality)}`}>
                      Quality: {entry.sleep_quality}/10 ({getQualityLabel(entry.sleep_quality)})
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.created_at!).toLocaleDateString()}
                  </span>
                </div>

                {(entry.bedtime || entry.wake_time) && (
                  <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    {entry.bedtime && (
                      <div>
                        <span className="text-gray-600">Bedtime:</span>{' '}
                        <span className="font-medium">
                          {new Date(entry.bedtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    {entry.wake_time && (
                      <div>
                        <span className="text-gray-600">Wake time:</span>{' '}
                        <span className="font-medium">
                          {new Date(entry.wake_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                )}

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

export default Sleep;
