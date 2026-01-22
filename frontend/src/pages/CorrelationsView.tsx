import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { correlationApi } from '../services/api';
import type { Correlation } from '../types';

const CorrelationsView: React.FC = () => {
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCorrelation, setSelectedCorrelation] = useState<Correlation | null>(null);
  const [timeRange, setTimeRange] = useState(90);
  const [filterStrength, setFilterStrength] = useState<string>('all');

  useEffect(() => {
    fetchCorrelations();
  }, [timeRange]);

  const fetchCorrelations = async () => {
    try {
      setLoading(true);
      const response = await correlationApi.getAll(timeRange);
      setCorrelations(response.data);
    } catch (error) {
      console.error('Error fetching correlations:', error);
      setCorrelations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      const response = await correlationApi.analyze();
      setCorrelations(response.data);
    } catch (error) {
      console.error('Error analyzing correlations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'weak':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'positive' ? '↗️' : '↘️';
  };

  const getCorrelationColor = (coefficient: number) => {
    if (coefficient > 0.7) return '#10b981';
    if (coefficient > 0.3) return '#84cc16';
    if (coefficient > -0.3) return '#9ca3af';
    if (coefficient > -0.7) return '#f59e0b';
    return '#ef4444';
  };

  const filteredCorrelations = correlations.filter((corr) => {
    if (filterStrength === 'all') return corr.is_significant;
    return corr.is_significant && corr.strength === filterStrength;
  });

  // Generate sample data points for scatter plot
  const generateScatterData = (correlation: Correlation) => {
    const points = [];
    const baseValue = 50;
    const coefficient = correlation.correlation_coefficient;

    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 100;
      const noise = (Math.random() - 0.5) * 30;
      const y = baseValue + coefficient * (x - 50) + noise;
      points.push({ x, y });
    }

    return points;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Analyzing correlations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discovered Correlations
          </h1>
          <p className="text-gray-600">
            Statistical relationships between your wellbeing metrics
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={180}>Last 6 months</option>
                <option value={365}>Last year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strength Filter
              </label>
              <select
                value={filterStrength}
                onChange={(e) => setFilterStrength(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Significant</option>
                <option value="strong">Strong Only</option>
                <option value="moderate">Moderate Only</option>
                <option value="weak">Weak Only</option>
              </select>
            </div>

            <div className="ml-auto">
              <button
                onClick={handleAnalyze}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Run New Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-2">Total Correlations</p>
            <p className="text-3xl font-bold text-gray-900">
              {filteredCorrelations.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-2">Strong Patterns</p>
            <p className="text-3xl font-bold text-green-600">
              {filteredCorrelations.filter((c) => c.strength === 'strong').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-2">Positive</p>
            <p className="text-3xl font-bold text-blue-600">
              {filteredCorrelations.filter((c) => c.direction === 'positive').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-2">Negative</p>
            <p className="text-3xl font-bold text-red-600">
              {filteredCorrelations.filter((c) => c.direction === 'negative').length}
            </p>
          </div>
        </div>

        {/* Correlations List */}
        {filteredCorrelations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              No Significant Correlations Found
            </h3>
            <p className="text-gray-600 mb-6">
              We need more data to discover meaningful patterns. Keep tracking your
              metrics!
            </p>
            <button
              onClick={handleAnalyze}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Analyze Current Data
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCorrelations.map((correlation) => (
              <div
                key={correlation.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Correlation Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getStrengthColor(
                            correlation.strength
                          )}`}
                        >
                          {correlation.strength.toUpperCase()}
                        </span>
                        <span className="text-2xl">
                          {getDirectionIcon(correlation.direction)}
                        </span>
                        <span className="text-sm text-gray-500">
                          r = {correlation.correlation_coefficient.toFixed(3)}
                        </span>
                        <span className="text-sm text-gray-500">
                          (p = {correlation.p_value.toFixed(4)})
                        </span>
                        <span className="text-sm text-gray-500">
                          n = {correlation.sample_size}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <p className="text-sm text-gray-500 uppercase mb-1">
                            {correlation.pillar_1}
                          </p>
                          <p className="text-lg font-semibold text-gray-800">
                            {correlation.metric_1}
                          </p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <p className="text-sm text-gray-500 uppercase mb-1">
                            {correlation.pillar_2}
                          </p>
                          <p className="text-lg font-semibold text-gray-800">
                            {correlation.metric_2}
                          </p>
                        </div>
                      </div>

                      {correlation.insight && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                          <p className="text-gray-700 leading-relaxed">
                            💡 {correlation.insight}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scatter Plot */}
                  <button
                    onClick={() =>
                      setSelectedCorrelation(
                        selectedCorrelation?.id === correlation.id
                          ? null
                          : correlation
                      )
                    }
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
                  >
                    {selectedCorrelation?.id === correlation.id
                      ? '▼ Hide Visualization'
                      : '▶ Show Visualization'}
                  </button>

                  {selectedCorrelation?.id === correlation.id && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="x"
                            type="number"
                            name={correlation.metric_1}
                            label={{
                              value: correlation.metric_1,
                              position: 'bottom',
                            }}
                          />
                          <YAxis
                            dataKey="y"
                            type="number"
                            name={correlation.metric_2}
                            label={{
                              value: correlation.metric_2,
                              angle: -90,
                              position: 'left',
                            }}
                          />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter
                            data={generateScatterData(correlation)}
                            fill={getCorrelationColor(
                              correlation.correlation_coefficient
                            )}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                      Get Recommendations
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Metadata Footer */}
                <div className="bg-gray-50 px-6 py-3 rounded-b-lg">
                  <p className="text-xs text-gray-500">
                    Discovered on{' '}
                    {new Date(correlation.discovered_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Understanding Correlations
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>
              • <strong>Strong correlations</strong> (|r| &gt; 0.7) indicate a
              powerful relationship between metrics
            </li>
            <li>
              • <strong>Positive correlations</strong> mean both metrics move in the
              same direction
            </li>
            <li>
              • <strong>Negative correlations</strong> mean metrics move in opposite
              directions
            </li>
            <li>
              • <strong>Statistical significance</strong> (p &lt; 0.05) means the
              pattern is unlikely to be random
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CorrelationsView;
