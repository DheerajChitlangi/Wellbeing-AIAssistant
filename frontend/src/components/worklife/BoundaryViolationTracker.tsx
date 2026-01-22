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
import { boundaryViolationApi } from '../../services/api';
import type { BoundaryViolation } from '../../types';

const VIOLATION_COLORS = {
  'after_hours_work': '#ef4444',
  'weekend_work': '#f59e0b',
  'missed_break': '#3b82f6',
  'overtime': '#8b5cf6',
  'vacation_interruption': '#ec4899',
};

const SEVERITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const BoundaryViolationTracker: React.FC = () => {
  const [violations, setViolations] = useState<BoundaryViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('month');

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const response = await boundaryViolationApi.getAll(0, 1000);
      setViolations(response.data);
    } catch (error) {
      console.error('Error fetching violations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredViolations = () => {
    const now = new Date();
    const cutoffDate = new Date();

    if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else {
      cutoffDate.setMonth(now.getMonth() - 1);
    }

    return violations.filter(v => new Date(v.occurred_at) >= cutoffDate);
  };

  const getViolationTrend = () => {
    const filtered = getFilteredViolations();
    const dailyData: { [key: string]: number } = {};

    filtered.forEach(violation => {
      const date = new Date(violation.occurred_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyData[date] = (dailyData[date] || 0) + 1;
    });

    return Object.entries(dailyData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getViolationTypeBreakdown = () => {
    const filtered = getFilteredViolations();
    const typeData: { [key: string]: number } = {};

    filtered.forEach(violation => {
      typeData[violation.violation_type] = (typeData[violation.violation_type] || 0) + 1;
    });

    return Object.entries(typeData).map(([name, value]) => ({
      name: name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      value,
      color: VIOLATION_COLORS[name as keyof typeof VIOLATION_COLORS],
    }));
  };

  const getSeverityBreakdown = () => {
    const filtered = getFilteredViolations();
    const severityData: { [key: string]: number } = {};

    filtered.forEach(violation => {
      severityData[violation.severity] = (severityData[violation.severity] || 0) + 1;
    });

    return Object.entries(severityData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: SEVERITY_COLORS[name as keyof typeof SEVERITY_COLORS],
    }));
  };

  const getRecentViolations = () => {
    return violations
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
      .slice(0, 10);
  };

  const getStats = () => {
    const filtered = getFilteredViolations();
    const totalViolations = filtered.length;
    const highSeverity = filtered.filter(v => v.severity === 'high').length;
    const totalMinutes = filtered.reduce((sum, v) => sum + (v.duration_minutes || 0), 0);
    const mostCommon = getViolationTypeBreakdown()[0]?.name || 'None';

    return {
      totalViolations,
      highSeverity,
      totalHours: (totalMinutes / 60).toFixed(1),
      mostCommon,
    };
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'after_hours_work':
        return '🌙';
      case 'weekend_work':
        return '📅';
      case 'missed_break':
        return '☕';
      case 'overtime':
        return '⏰';
      case 'vacation_interruption':
        return '🏖️';
      default:
        return '⚠️';
    }
  };

  const getSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };

    return styles[severity];
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading violation data...</div>
      </div>
    );
  }

  const stats = getStats();
  const violationTrend = getViolationTrend();
  const violationTypeBreakdown = getViolationTypeBreakdown();
  const severityBreakdown = getSeverityBreakdown();
  const recentViolations = getRecentViolations();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Boundary Violation Tracker</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`rounded-lg shadow p-4 ${stats.totalViolations > 20 ? 'bg-red-100' : stats.totalViolations > 10 ? 'bg-yellow-100' : 'bg-green-100'}`}>
          <div className="text-sm font-medium text-gray-600 mb-2">Total Violations</div>
          <div className={`text-2xl font-bold ${stats.totalViolations > 20 ? 'text-red-600' : stats.totalViolations > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
            {stats.totalViolations}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">High Severity</div>
          <div className={`text-2xl font-bold ${stats.highSeverity > 5 ? 'text-red-600' : 'text-orange-600'}`}>
            {stats.highSeverity}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Hours</div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalHours}h</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500 mb-2">Most Common</div>
          <div className="text-lg font-bold text-blue-600">{stats.mostCommon}</div>
        </div>
      </div>

      {stats.totalViolations > 15 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🚨</div>
            <div className="flex-1">
              <div className="font-semibold text-red-900 mb-2">High Violation Alert</div>
              <div className="text-red-800">
                You have {stats.totalViolations} boundary violations in the last {timeRange}. This is above healthy levels.
                Consider reviewing your work patterns and establishing stronger boundaries.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Violation Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={violationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} name="Violations" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Violation Types</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={violationTypeBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {violationTypeBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Severity Levels</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={severityBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" name="Count">
                {severityBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Violation Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={violationTypeBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" name="Count">
                {violationTypeBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Violations</h2>
        {recentViolations.length > 0 ? (
          <div className="space-y-3">
            {recentViolations.map((violation, index) => (
              <div key={violation.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">{getViolationIcon(violation.violation_type)}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {violation.violation_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {formatDateTime(violation.occurred_at)}
                        {violation.duration_minutes && (
                          <span className="ml-2">• {violation.duration_minutes} minutes</span>
                        )}
                      </div>
                      {violation.notes && (
                        <div className="text-sm text-gray-500 bg-gray-50 rounded p-2 mt-2">
                          {violation.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityBadge(violation.severity)}`}>
                    {violation.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <div>No violations recorded yet. Keep up the good boundaries!</div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Boundary Protection Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">🔔</div>
            <div className="font-semibold text-gray-900 mb-2">Set Clear Hours</div>
            <div className="text-sm text-gray-700">
              Define your work hours and communicate them to your team. Use calendar blocks to protect your time.
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">📵</div>
            <div className="font-semibold text-gray-900 mb-2">Disconnect After Hours</div>
            <div className="text-sm text-gray-700">
              Turn off work notifications outside of work hours. Create physical and digital boundaries.
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">💬</div>
            <div className="font-semibold text-gray-900 mb-2">Communicate Boundaries</div>
            <div className="text-sm text-gray-700">
              Be clear about your availability and response times. It's okay to say no to protect your wellbeing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoundaryViolationTracker;
