'use client';

import { useState, useEffect } from 'react';
import { analyticsService, CampaignAnalytics } from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MousePointer, Users, TrendingUp, Target } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function CampaignAnalyticsComponent() {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [period, setPeriod] = useState('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getCampaignAnalytics(period);
      console.log('[CampaignAnalytics] Received data:', data);
      console.log('[CampaignAnalytics] Total clicks:', data.total_clicks);
      console.log('[CampaignAnalytics] Campaigns:', data.campaigns);
      setAnalytics(data);
    } catch (error) {
      console.error('[CampaignAnalytics] Failed to load campaign analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics || analytics.campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Aucune donnée sur les campagnes publicitaires</p>
        <p className="text-sm text-gray-400 mt-2">
          Ajoutez des paramètres UTM à vos liens pour suivre les campagnes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analytique des campagnes publicitaires</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionner la période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 jours</SelectItem>
            <SelectItem value="30days">30 jours</SelectItem>
            <SelectItem value="90days">90 jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des clics</CardTitle>
            <MousePointer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_clicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campagnes actives</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_campaigns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                analytics.campaigns.reduce((sum, c) => sum + c.conversion_rate, 0) /
                analytics.campaigns.length
              ).toFixed(2)}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Efficacité des campagnes</CardTitle>
          <CardDescription>Comparaison des conversions par campagne</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.campaigns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="campaign" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="clicks" fill="#3b82f6" name="Clics" />
              <Bar yAxisId="right" dataKey="conversions" fill="#10b981" name="Conversions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analytics.campaigns.map((campaign, index) => (
          <Card key={campaign.campaign}>
            <CardHeader>
              <CardTitle className="text-lg">{campaign.campaign}</CardTitle>
              <CardDescription>Statistiques détaillées de la campagne</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Clics</p>
                    <p className="text-2xl font-bold">{campaign.clicks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Utilisateurs uniques</p>
                    <p className="text-2xl font-bold">{campaign.unique_users}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Conversions</p>
                    <p className="text-2xl font-bold text-green-600">{campaign.conversions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Conversion</p>
                    <p className="text-2xl font-bold text-blue-600">{campaign.conversion_rate}%</p>
                  </div>
                </div>

                {Object.keys(campaign.sources).length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Sources de trafic:</p>
                    <div className="space-y-1">
                      {Object.entries(campaign.sources).map(([source, count]) => (
                        <div key={source} className="flex justify-between text-sm">
                          <span className="text-gray-600">{source}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommandations d'optimisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.campaigns.map((campaign) => {
              if (campaign.conversion_rate < 5) {
                return (
                  <div key={campaign.campaign} className="p-4 bg-yellow-50 rounded-lg">
                    <p className="font-semibold text-yellow-800">
                      {campaign.campaign}
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Faible conversion ({campaign.conversion_rate}%). Nous recommandons de revoir
                      l'audience cible et d'optimiser la page de destination.
                    </p>
                  </div>
                );
              }
              if (campaign.conversion_rate > 15) {
                return (
                  <div key={campaign.campaign} className="p-4 bg-green-50 rounded-lg">
                    <p className="font-semibold text-green-800">
                      {campaign.campaign}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Excellente conversion ({campaign.conversion_rate}%)! Envisagez
                      d'augmenter le budget de cette campagne.
                    </p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
