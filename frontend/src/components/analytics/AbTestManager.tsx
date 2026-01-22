'use client';

import { useState, useEffect } from 'react';
import { analyticsService, AbTestResults } from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube, Users, TrendingUp, CheckCircle } from 'lucide-react';

interface AbTest {
  id: number;
  name: string;
  key: string;
  description?: string;
  variants: string[];
  is_active: boolean;
  started_at: string;
  ended_at?: string;
}

export default function AbTestManager() {
  const [tests, setTests] = useState<AbTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<AbTestResults | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTestResults = async (testId: number) => {
    try {
      setLoading(true);
      setSelectedTest(testId);
      const results = await analyticsService.getAbTestResults(testId);
      setTestResults(results);
    } catch (error) {
      console.error('Failed to load test results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWinningVariant = (results: AbTestResults): string | null => {
    const variants = Object.entries(results.variant_stats);
    if (variants.length === 0) return null;

    const winner = variants.reduce((best, current) => {
      return current[1].conversion_rate > best[1].conversion_rate ? current : best;
    });

    return winner[0];
  };

  if (tests.length === 0) {
    return (
      <div className="text-center py-12">
        <TestTube className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Aucun test A/B actif</p>
        <p className="text-sm text-gray-400 mt-2">
          Créez un test via le panneau d'administration pour commencer les expériences
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Tests A/B</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => (
          <Card
            key={test.id}
            className={`cursor-pointer transition-all ${
              selectedTest === test.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => loadTestResults(test.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{test.name}</CardTitle>
                {test.is_active ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Actif
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                    Terminé
                  </span>
                )}
              </div>
              <CardDescription>{test.description || test.key}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Variantes: {test.variants.join(', ')}
                </p>
                <p className="text-xs text-gray-500">
                  Début: {new Date(test.started_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {testResults && !loading && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Résultats du test: {testResults.test.name}</CardTitle>
              <CardDescription>{testResults.test.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Total des participants
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {testResults.overall.total_assignments}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Total des conversions
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {testResults.overall.total_conversions}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">
                      Conversion globale
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    {testResults.overall.conversion_rate}%
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Comparaison des variantes</h3>
                {Object.entries(testResults.variant_stats).map(([variant, stats]) => {
                  const isWinner = variant === getWinningVariant(testResults);
                  return (
                    <div
                      key={variant}
                      className={`p-4 rounded-lg border-2 ${
                        isWinner
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">
                          Variante: {variant}
                          {isWinner && (
                            <span className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                              Gagnant
                            </span>
                          )}
                        </h4>
                        <span className="text-2xl font-bold text-blue-600">
                          {stats.conversion_rate}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Participants</p>
                          <p className="font-semibold">{stats.assignments}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Conversions</p>
                          <p className="font-semibold">{stats.conversions}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Conversion</p>
                          <p className="font-semibold">{stats.conversion_rate}%</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isWinner ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${stats.conversion_rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {testResults.test.is_active && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Attention:</strong> Le test est toujours actif. Il est recommandé
                    de collecter plus de données avant de décider du gagnant.
                  </p>
                </div>
              )}

              {!testResults.test.is_active && getWinningVariant(testResults) && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Recommandation:</strong> La variante "
                    {getWinningVariant(testResults)}" a montré les meilleurs résultats.
                    Envisagez d'utiliser cette variante pour tous les
                    utilisateurs.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
