import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';
import { biometricApi } from '../../services/api';
import type { Biometric } from '../../types';

const BiometricsTracker: React.FC = () => {
  const [biometrics, setBiometrics] = useState<Biometric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'weight' | 'blood_pressure' | 'heart_rate' | 'glucose' | 'temperature'>('all');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchBiometrics();
  }, []);

  const fetchBiometrics = async () => {
    try {
      setLoading(true);
      const response = await biometricApi.getAll(0, 1000);
      setBiometrics(response.data);
    } catch (error) {
      console.error('Error fetching biometrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBiometrics = () => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    let filtered = biometrics.filter(b => new Date(b.measured_at) >= cutoffDate);

    if (selectedMetric !== 'all') {
      filtered = filtered.filter(b => b.metric_type === selectedMetric);
    }

    return filtered;
  };

  const getWeightData = () => {
    const weightData = biometrics
      .filter(b => b.metric_type === 'weight')
      .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
      .map(b => ({
        date: new Date(b.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: b.value,
      }));

    return weightData.slice(-30);
  };

  const getBloodPressureData = () => {
    const bpData = biometrics
      .filter(b => b.metric_type === 'blood_pressure')
      .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
      .map(b => ({
        date: new Date(b.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        systolic: b.value,
        diastolic: b.value_secondary || 0,
      }));

    return bpData.slice(-30);
  };

  const getHeartRateData = () => {
    const hrData = biometrics
      .filter(b => b.metric_type === 'heart_rate')
      .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
      .map(b => ({
        date: new Date(b.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        heartRate: b.value,
      }));

    return hrData.slice(-30);
  };

  const getGlucoseData = () => {
    const glucoseData = biometrics
      .filter(b => b.metric_type === 'glucose')
      .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
      .map(b => ({
        date: new Date(b.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        glucose: b.value,
      }));

    return glucoseData.slice(-30);
  };

  const getTemperatureData = () => {
    const tempData = biometrics
      .filter(b => b.metric_type === 'temperature')
      .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
      .map(b => ({
        date: new Date(b.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        temperature: b.value,
      }));

    return tempData.slice(-30);
  };

  const getLatestMetrics = () => {
    const latestByType: { [key: string]: Biometric } = {};

    biometrics.forEach(b => {
      if (!latestByType[b.metric_type] ||
          new Date(b.measured_at) > new Date(latestByType[b.metric_type].measured_at)) {
        latestByType[b.metric_type] = b;
      }
    });

    return latestByType;
  };

  const formatValue = (metric: Biometric) => {
    if (metric.metric_type === 'blood_pressure') {
      return `${metric.value}/${metric.value_secondary || 0} ${metric.unit}`;
    }
    return `${metric.value} ${metric.unit}`;
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return '⚖️';
      case 'blood_pressure':
        return '💓';
      case 'heart_rate':
        return '❤️';
      case 'glucose':
        return '🩸';
      case 'temperature':
        return '🌡️';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading biometric data...</div>
      </div>
    );
  }

  const latestMetrics = getLatestMetrics();
  const weightData = getWeightData();
  const bloodPressureData = getBloodPressureData();
  const heartRateData = getHeartRateData();
  const glucoseData = getGlucoseData();
  const temperatureData = getTemperatureData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Biometrics Tracker</h1>
        <div className="flex gap-2">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Metrics</option>
            <option value="weight">Weight</option>
            <option value="blood_pressure">Blood Pressure</option>
            <option value="heart_rate">Heart Rate</option>
            <option value="glucose">Glucose</option>
            <option value="temperature">Temperature</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(latestMetrics).map(([type, metric]) => (
          <div key={type} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getMetricIcon(type)}</span>
              <div className="text-sm font-medium text-gray-500">
                {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </div>
            </div>
            <div className="text-xl font-bold text-blue-600">
              {formatValue(metric)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(metric.measured_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {weightData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Weight Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="weight" fill="#3b82f6" fillOpacity={0.3} stroke="none" />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} name="Weight (kg)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {bloodPressureData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Blood Pressure</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bloodPressureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {heartRateData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Heart Rate</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={heartRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[40, 120]} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="heartRate" fill="#ef4444" fillOpacity={0.3} stroke="none" />
                <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={3} name="Heart Rate (bpm)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {glucoseData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Blood Glucose</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={glucoseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="glucose" stroke="#f59e0b" strokeWidth={3} name="Glucose (mg/dL)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {temperatureData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Body Temperature</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[35, 40]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={3} name="Temperature (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {biometrics.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-lg mb-2">No biometric data available</div>
          <div className="text-gray-500">Start tracking your health metrics to see trends and insights</div>
        </div>
      )}
    </div>
  );
};

export default BiometricsTracker;
