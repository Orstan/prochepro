'use client';

import { useState } from 'react';
import AnalyticsAccessGuard from '@/components/analytics/AnalyticsAccessGuard';
import BusinessAnalyticsDashboard from '@/components/analytics/BusinessAnalyticsDashboard';
import DemandForecastChart from '@/components/analytics/DemandForecastChart';
import CampaignAnalytics from '@/components/analytics/CampaignAnalytics';
import AbTestManager from '@/components/analytics/AbTestManager';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'business' | 'forecast' | 'campaigns' | 'abtests'>('business');

  const tabs = [
    { id: 'business' as const, label: 'Analytique Business', icon: '📊' },
    { id: 'forecast' as const, label: 'Prévision de la demande', icon: '📈' },
    { id: 'campaigns' as const, label: 'Campagnes publicitaires', icon: '🎯' },
    { id: 'abtests' as const, label: 'Tests A/B', icon: '🧪' },
  ];

  return (
    <AnalyticsAccessGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Analytique avancée
            </h1>
            <p className="text-gray-600">
              Suivez les performances de votre activité et prenez des décisions éclairées
            </p>
          </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
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
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'business' && <BusinessAnalyticsDashboard />}
          {activeTab === 'forecast' && <DemandForecastChart />}
          {activeTab === 'campaigns' && <CampaignAnalytics />}
          {activeTab === 'abtests' && <AbTestManager />}
        </div>
      </div>
    </div>
    </AnalyticsAccessGuard>
  );
}
