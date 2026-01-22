'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { TrendingUp, Award, DollarSign, Lightbulb, Target, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface Ranking {
  overall: {
    rank: number;
    total: number;
    percentile: number;
  };
  city: {
    name: string;
    rank: number;
    total: number;
    percentile: number;
  } | null;
  category: {
    name: string;
    rank: number;
    total: number;
    percentile: number;
  } | null;
}

interface Recommendation {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  action: string;
}

interface Recommendations {
  profile_score: number;
  max_score: number;
  completion_percentage: number;
  items: Recommendation[];
}

interface PriceRecommendation {
  type: string;
  message: string;
  suggested_rate: number | null;
}

interface Pricing {
  your_rate: number | null;
  currency: string;
  city?: {
    name: string;
    average: number;
    median: number;
    min: number;
    max: number;
    sample_size: number;
  };
  category?: {
    name: string;
    average: number;
    median: number;
    min: number;
    max: number;
    sample_size: number;
  };
  recommendations: PriceRecommendation[];
}

interface Insights {
  ranking: Ranking;
  recommendations: Recommendations;
  pricing: Pricing;
}

export default function ProviderInsightsDashboard() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('prochepro_token');
      
      const response = await fetch(`${API_BASE_URL}/api/insights/provider`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="text-center py-8 text-red-600">
        {error || 'Erreur de chargement'}
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return 'text-green-600';
    if (percentile >= 60) return 'text-blue-600';
    if (percentile >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8" />
          <h2 className="text-2xl md:text-3xl font-bold">Devenez Plus Performant</h2>
        </div>
        <p className="text-sky-100">
          Analysez votre position, améliorez votre profil et optimisez vos tarifs
        </p>
      </div>

      {/* Profile Score */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-sky-600" />
            Score du Profil
          </h3>
          <span className="text-3xl font-bold text-sky-600">
            {insights.recommendations.completion_percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getScoreColor(insights.recommendations.completion_percentage)}`}
            style={{ width: `${insights.recommendations.completion_percentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-600">
          {insights.recommendations.profile_score} / {insights.recommendations.max_score} points
        </p>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Ranking */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold text-slate-900">Classement Global</h4>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-1">
              #{insights.ranking.overall.rank}
            </div>
            <div className="text-sm text-slate-600 mb-2">
              sur {insights.ranking.overall.total} prestataires
            </div>
            <div className={`text-2xl font-bold ${getPercentileColor(insights.ranking.overall.percentile)}`}>
              Top {100 - insights.ranking.overall.percentile}%
            </div>
          </div>
        </div>

        {/* City Ranking */}
        {insights.ranking.city && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-slate-900">Dans {insights.ranking.city.name}</h4>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-1">
                #{insights.ranking.city.rank}
              </div>
              <div className="text-sm text-slate-600 mb-2">
                sur {insights.ranking.city.total} prestataires
              </div>
              <div className={`text-2xl font-bold ${getPercentileColor(insights.ranking.city.percentile)}`}>
                Top {100 - insights.ranking.city.percentile}%
              </div>
            </div>
          </div>
        )}

        {/* Category Ranking */}
        {insights.ranking.category && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-slate-900">{insights.ranking.category.name}</h4>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-1">
                #{insights.ranking.category.rank}
              </div>
              <div className="text-sm text-slate-600 mb-2">
                sur {insights.ranking.category.total} prestataires
              </div>
              <div className={`text-2xl font-bold ${getPercentileColor(insights.ranking.category.percentile)}`}>
                Top {100 - insights.ranking.category.percentile}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {insights.recommendations.items.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            Conseils pour Améliorer Votre Profil
          </h3>
          <div className="space-y-3">
            {insights.recommendations.items.map((rec, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {rec.priority === 'high' ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <CheckCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <span className="text-xs font-medium px-2 py-1 rounded uppercase">
                        {rec.priority === 'high' ? 'Urgent' : rec.priority === 'medium' ? 'Important' : 'Optionnel'}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{rec.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <TrendingUp className="h-4 w-4" />
                      <span>{rec.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          Tarifs Optimaux
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* City Pricing */}
          {insights.pricing.city && (
            <div className="border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">
                Tarifs à {insights.pricing.city.name}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Moyenne:</span>
                  <span className="font-semibold">{insights.pricing.city.average} €/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Médiane:</span>
                  <span className="font-semibold">{insights.pricing.city.median} €/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Minimum:</span>
                  <span className="font-semibold">{insights.pricing.city.min} €/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Maximum:</span>
                  <span className="font-semibold">{insights.pricing.city.max} €/h</span>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Basé sur {insights.pricing.city.sample_size} prestataires
                </div>
              </div>
            </div>
          )}

          {/* Category Pricing */}
          {insights.pricing.category && (
            <div className="border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">
                Tarifs pour {insights.pricing.category.name}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Moyenne:</span>
                  <span className="font-semibold">{insights.pricing.category.average} €/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Médiane:</span>
                  <span className="font-semibold">{insights.pricing.category.median} €/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Minimum:</span>
                  <span className="font-semibold">{insights.pricing.category.min} €/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Maximum:</span>
                  <span className="font-semibold">{insights.pricing.category.max} €/h</span>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Basé sur {insights.pricing.category.sample_size} prestataires
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Recommendations */}
        {insights.pricing.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Recommandations de Prix</h4>
            {insights.pricing.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  rec.type === 'price_optimal'
                    ? 'bg-green-50 border-green-200'
                    : rec.type === 'price_high'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <p className="text-sm text-slate-700">{rec.message}</p>
                {rec.suggested_rate && (
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    Tarif suggéré: {rec.suggested_rate} €/h
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {insights.pricing.your_rate && (
          <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Votre tarif actuel:</span>
              <span className="text-xl font-bold text-sky-600">
                {insights.pricing.your_rate} €/h
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
