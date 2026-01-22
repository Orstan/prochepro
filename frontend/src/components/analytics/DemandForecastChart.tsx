'use client';

import { useState, useEffect } from 'react';
import { analyticsService, DemandForecast } from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

export default function DemandForecastChart() {
  const [forecast, setForecast] = useState<DemandForecast | null>(null);
  const [daysAhead, setDaysAhead] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, [daysAhead]);

  const loadForecast = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDemandForecast(undefined, parseInt(daysAhead));
      setForecast(data);
    } catch (error) {
      console.error('Failed to load forecast:', error);
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

  if (!forecast) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Impossible de charger les prévisions</p>
      </div>
    );
  }

  // Check if there's historical data
  if (!forecast.historical_data || forecast.historical_data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pas encore de données historiques</h3>
          <p className="text-sm text-gray-600">
            Les prévisions de la demande nécessitent au moins 90 jours de données historiques sur les tâches créées.
          </p>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (forecast.trend) {
      case 'growing':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendText = () => {
    switch (forecast.trend) {
      case 'growing':
        return 'Demande croissante';
      case 'declining':
        return 'Demande décroissante';
      default:
        return 'Demande stable';
    }
  };

  const getTrendColor = () => {
    switch (forecast.trend) {
      case 'growing':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const combinedData = [
    ...forecast.historical_data.map(d => ({ ...d, type: 'historical' })),
    ...forecast.forecast.map(d => ({ date: d.date, count: d.predicted_tasks, type: 'forecast' })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Prévision de la demande de services</h2>
        <Select value={daysAhead} onValueChange={setDaysAhead}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Période de prévision" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 jours</SelectItem>
            <SelectItem value="14">14 jours</SelectItem>
            <SelectItem value="30">30 jours</SelectItem>
            <SelectItem value="60">60 jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendance</CardTitle>
            {getTrendIcon()}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTrendColor()}`}>
              {getTrendText()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Précision de la prévision</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecast.confidence.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Niveau de confiance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne par jour</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecast.average_daily_tasks.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-1">Tâches par jour</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Données historiques et prévisions</CardTitle>
          <CardDescription>
            Ligne bleue - données historiques, orange - prévisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                name="Nombre de tâches"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interprétation des prévisions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Que signifie cette prévision?</h4>
              <p className="text-gray-600">
                {forecast.trend === 'growing' && 
                  'La demande de services augmente. C\'est le bon moment pour rechercher activement des clients et augmenter les prix.'}
                {forecast.trend === 'declining' && 
                  'La demande de services diminue. Envisagez de diversifier les services ou les campagnes marketing.'}
                {forecast.trend === 'stable' && 
                  'La demande de services est stable. Maintenez le niveau d\'activité actuel.'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Recommandations</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {forecast.trend === 'growing' && (
                  <>
                    <li>Augmentez votre présence sur la plateforme</li>
                    <li>Envisagez d'augmenter vos prix</li>
                    <li>Préparez-vous à une augmentation du volume de travail</li>
                  </>
                )}
                {forecast.trend === 'declining' && (
                  <>
                    <li>Mettez à jour votre portfolio</li>
                    <li>Proposez des offres spéciales</li>
                    <li>Élargissez votre gamme de services</li>
                  </>
                )}
                {forecast.trend === 'stable' && (
                  <>
                    <li>Maintenez la qualité des services</li>
                    <li>Travaillez sur les avis clients</li>
                    <li>Optimisez vos processus</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
