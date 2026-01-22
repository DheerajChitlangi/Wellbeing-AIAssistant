import React, { useState } from 'react';
import {
  BalanceScoreCard,
  WorkHoursCalendar,
  MeetingLoadView,
  EnergyPatternChart,
  BurnoutRiskAlert,
  BoundaryViolationTracker,
} from '../components/worklife';

type TabType = 'overview' | 'hours' | 'meetings' | 'energy' | 'boundaries';

const WorkLife: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '⚖️' },
    { id: 'hours' as TabType, label: 'Work Hours', icon: '🕒' },
    { id: 'meetings' as TabType, label: 'Meetings', icon: '📅' },
    { id: 'energy' as TabType, label: 'Energy Patterns', icon: '⚡' },
    { id: 'boundaries' as TabType, label: 'Boundaries', icon: '🚧' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Work-Life Balance</h1>
          </div>
          <div className="flex gap-1 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <BurnoutRiskAlert />
            <BalanceScoreCard />
          </div>
        )}

        {activeTab === 'hours' && <WorkHoursCalendar />}

        {activeTab === 'meetings' && <MeetingLoadView />}

        {activeTab === 'energy' && <EnergyPatternChart />}

        {activeTab === 'boundaries' && <BoundaryViolationTracker />}
      </div>
    </div>
  );
};

export default WorkLife;
