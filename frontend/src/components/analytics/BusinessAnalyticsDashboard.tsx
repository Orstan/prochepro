'use client';

import { useState, useEffect } from 'react';
import { analyticsService, BusinessAnalytics } from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Eye, TrendingUp, CheckCircle, DollarSign, Users } from 'lucide-react';

export default function BusinessAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [period, setPeriod] = useState('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getBusinessAnalytics(period);
      console.log('[BusinessAnalytics] Received data:', data);
      console.log('[BusinessAnalytics] Profile views:', data.profile_views);
      console.log('[BusinessAnalytics] Offers:', data.offers);
      console.log('[BusinessAnalytics] Tasks:', data.tasks);
      console.log('[BusinessAnalytics] Revenue:', data.revenue);
      setAnalytics(data);
    } catch (error) {
      console.error('[BusinessAnalytics] Failed to load analytics:', error);
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

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Impossible de charger les analyses</p>
      </div>
    );
  }

  // Check if there's any data - show interface even with 0 values
  const hasData = true; // Always show the interface, even with zero values
  
  if (!hasData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pas encore de données</h3>
          <p className="text-sm text-gray-600">
            Vos statistiques apparaîtront ici dès que vous commencerez à recevoir des vues de profil, des offres et des missions.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Vues du profil',
      value: analytics.profile_views.total,
      icon: Eye,
      description: `${analytics.profile_views.unique_viewers} uniques`,
      color: 'text-blue-600',
    },
    {
      title: 'Offres reçues',
      value: analytics.offers.total,
      icon: TrendingUp,
      description: `${analytics.offers.accepted} acceptées`,
      color: 'text-green-600',
    },
    {
      title: 'Missions terminées',
      value: analytics.tasks.completed,
      icon: CheckCircle,
      description: 'Sur la période',
      color: 'text-purple-600',
    },
    {
      title: 'Revenu total',
      value: `€${analytics.revenue.total.toFixed(2)}`,
      icon: DollarSign,
      description: `€${analytics.revenue.average_per_task.toFixed(2)} moyen`,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analytique Business</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionner la période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 jours</SelectItem>
            <SelectItem value="30days">30 jours</SelectItem>
            <SelectItem value="90days">90 jours</SelectItem>
            <SelectItem value="1year">1 an</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vues du profil par jour</CardTitle>
            <CardDescription>Évolution des vues de votre profil</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.profile_views.by_day}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Vues" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion des offres</CardTitle>
            <CardDescription>Pourcentage d'offres acceptées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-600">
                  {analytics.offers.conversion_rate}%
                </div>
                <p className="text-gray-500 mt-4">Conversion</p>
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total des offres:</span>
                    <span className="font-semibold">{analytics.offers.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Acceptées:</span>
                    <span className="font-semibold text-green-600">{analytics.offers.accepted}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {analytics.top_referrers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top sources de trafic</CardTitle>
            <CardDescription>D'où viennent les visiteurs de votre profil</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.top_referrers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="referrer" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name="Vues" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
