'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReload = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Icon */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-slate-600" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pas de connexion Internet
            </h1>
            <p className="text-gray-600 text-sm">
              Vous êtes actuellement hors ligne. Veuillez vérifier votre connexion Internet pour continuer.
            </p>
          </div>

          {/* Status */}
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
            isOnline 
              ? 'bg-green-100 text-green-700' 
              : 'bg-orange-100 text-orange-700'
          }`}>
            {isOnline ? '✓ Connexion rétablie' : '⚠ Hors ligne'}
          </div>

          {/* Action Button */}
          <button
            onClick={handleReload}
            disabled={!isOnline}
            className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              isOnline
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <RefreshCw size={18} />
            <span>Réessayer</span>
          </button>

          {/* Tips */}
          <div className="text-left space-y-2 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-700 mb-2">💡 Conseils:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Vérifiez votre connexion Wi-Fi ou données mobiles</li>
              <li>• Essayez d'activer/désactiver le mode avion</li>
              <li>• Certaines fonctionnalités sont disponibles hors ligne</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-4">
          ProchePro • Application Progressive Web
        </p>
      </div>
    </div>
  );
}
