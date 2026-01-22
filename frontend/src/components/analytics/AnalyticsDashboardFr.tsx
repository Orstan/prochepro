'use client';

import { useState } from 'react';
import BusinessAnalyticsDashboard from './BusinessAnalyticsDashboard';
import DemandForecastChart from './DemandForecastChart';
import AbTestManager from './AbTestManager';

export default function AnalyticsDashboardFr() {
  const [activeTab, setActiveTab] = useState<'business' | 'forecast' | 'abtests'>('business');

  const tabs = [
    { id: 'business' as const, label: 'Analytique Business', icon: '📊' },
    { id: 'forecast' as const, label: 'Prévision de la demande', icon: '📈' },
    { id: 'abtests' as const, label: 'Tests A/B', icon: '🧪' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analytique avancée
        </h2>
        <p className="text-gray-600 text-sm">
          Suivez l'efficacité de votre entreprise et prenez des décisions éclairées
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'business' && <BusinessAnalyticsDashboard />}
        {activeTab === 'forecast' && <DemandForecastChart />}
        {activeTab === 'abtests' && <AbTestManager />}
      </div>
    </div>
  );
}
