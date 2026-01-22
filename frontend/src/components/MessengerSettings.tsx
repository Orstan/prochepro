import React, { useState, useEffect } from 'react';
import { 
  getMessengerSettings, 
  updateMessengerSettings, 
  connectTelegram,
  connectTelegramDirect,
  testNotification,
  MessengerSettings as MessengerSettingsType
} from '@/lib/api/messengerService';

interface MessengerSettingsProps {
  onSaved?: () => void;
  className?: string;
}

const MessengerSettings: React.FC<MessengerSettingsProps> = ({ onSaved, className = '' }) => {
  const [settings, setSettings] = useState<MessengerSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Видалено поле для вводу логіна Telegram та відповідні стани
  const [testingNotification, setTestingNotification] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [autoReloading, setAutoReloading] = useState(false);
  const [reloadCountdown, setReloadCountdown] = useState(0);

  const notificationTypes = [
    { value: 'new_task', label: 'Nouvelles annonces' },
    { value: 'new_offer', label: 'Nouvelles offres' },
    { value: 'offer_accepted', label: 'Offre acceptée' },
    { value: 'message', label: 'Nouveaux messages' },
    { value: 'task_status', label: 'Changement de statut' },
    { value: 'payment', label: 'Paiements' },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getMessengerSettings();
      
      // Перевірка та ініціалізація полів
      const safeData = {
        ...data,
        notification_types: Array.isArray(data.notification_types) && data.notification_types.length > 0 
          ? data.notification_types 
          : ['new_task', 'new_offer', 'offer_accepted', 'message', 'task_status', 'payment'],
        telegram_username: data.telegram_username || '',
        telegram_chat_id: data.telegram_chat_id || null,
      };
      
      setSettings(safeData);
    } catch (err) {
      setError('Impossible de charger les paramètres de messagerie');
      
      // Встановлюємо налаштування за замовчуванням для уникнення помилок
      setSettings({
        id: 0,
        user_id: 0,
        telegram_chat_id: null,
        telegram_username: '',
        notification_types: ['new_task', 'new_offer', 'offer_accepted', 'message', 'task_status', 'payment'], // Всі типи сповіщень
        created_at: '',
        updated_at: '',
        whatsapp_number: null,
        whatsapp_verified: false,
        whatsapp_enabled: false
      } as MessengerSettingsType);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!settings) return;

      await updateMessengerSettings({
        notification_types: settings.notification_types,
      });

      setSuccess('Paramètres enregistrés avec succès');
      if (onSaved) onSaved();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotificationType = (type: string) => {
    if (!settings) return;
    
    // Перевірка на наявність notification_types та ініціалізація якщо потрібно
    const currentTypes = Array.isArray(settings.notification_types) ? settings.notification_types : [];

    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];

    setSettings({
      ...settings,
      notification_types: updatedTypes,
    });
  };

  // WhatsApp функціонал видалено

  const handleConnectTelegram = async () => {
    try {
      setError(null);
      setSuccess(null);
      setSaving(true);

      // Використовуємо нову функцію для прямого підключення без вводу логіна
      const result = await connectTelegramDirect();
      
      if (result.success) {
        setSuccess(result.message || 'Veuillez ouvrir Telegram et démarrer une conversation avec notre bot');
        
        // Open Telegram deep link in a new tab
        if (result.deep_link) {
          window.open(result.deep_link, '_blank');
        }
        
        // Показуємо повідомлення про необхідність перезавантаження сторінки
        setSuccess('Veuillez ouvrir Telegram, envoyer /start au bot');
        
        // Додаємо візуальну індикацію про перезавантаження сторінки
        setAutoReloading(true);
        setReloadCountdown(15);
        
        // Запускаємо таймер відліку
        const countdownInterval = setInterval(() => {
          setReloadCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              // Перезавантажуємо сторінку
              window.location.reload();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Оновлюємо налаштування
        setTimeout(fetchSettings, 5000);
      } else {
        setError(result.message || 'Erreur lors de la connexion à Telegram');
      }
    } catch (err) {
      setError('Erreur lors de la connexion à Telegram');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setError(null);
      setSuccess(null);
      setTestingNotification(true);
      setTestResults(null);

      const result = await testNotification();
      
      if (result.success) {
        setTestResults(result.results);
      } else {
        setError('Erreur lors du test des notifications');
      }
    } catch (err) {
      setError('Erreur lors du test des notifications');
    } finally {
      setTestingNotification(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-slate-900 mb-4">
        Notifications par messagerie
      </h2>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {success}
          {autoReloading && (
            <div className="mt-2 flex items-center">
              <div className="mr-2 h-2 w-full bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-emerald-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${(reloadCountdown / 15) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium">{reloadCountdown}s</span>
            </div>
          )}
        </div>
      )}

      {settings && (
        <>
          {/* WhatsApp Section видалено */}
          
          {/* Telegram Section */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✈️</span>
                <h3 className="text-lg font-medium text-slate-900">Telegram</h3>
              </div>
            </div>
            
            {settings.telegram_chat_id ? (
              <div className="flex flex-col space-y-2 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    @{settings.telegram_username}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Connecté
                  </span>
                </div>
                <div className="text-xs text-emerald-600">
                  ✅ Notifications Telegram activées pour les types sélectionnés
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 mb-3">
                  <p className="text-sm text-sky-800">
                    <span className="font-medium block mb-1">Comment connecter Telegram:</span>
                    1. Cliquez sur le bouton "Connecter avec Telegram"<br/>
                    2. Ouvrez Telegram et recherchez notre bot <strong>@ProchePro_bot</strong><br/>
                    3. Envoyez la commande <strong>/start</strong> au bot<br/>
                    4. Revenez sur cette page et rafraîchissez-la
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleConnectTelegram}
                    disabled={saving}
                    className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connexion...
                      </>
                    ) : (
                      <>
                        <span className="text-xl">✈️</span>
                        Connecter avec Telegram
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Notification Types */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-900 mb-3">
              Types de notifications
            </h3>
            
            <div className="space-y-2">
              {notificationTypes.map((type) => (
                <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Array.isArray(settings.notification_types) && settings.notification_types.includes(type.value)}
                    onChange={() => handleToggleNotificationType(type.value)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Test Notifications */}
          {settings.telegram_chat_id && (
            <div className="mb-6">
              <button
                type="button"
                onClick={handleTestNotification}
                disabled={testingNotification}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {testingNotification ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Test en cours...
                  </>
                ) : (
                  <>
                    <span>🔔</span>
                    Tester les notifications
                  </>
                )}
              </button>
              
              {testResults && (
                <div className="mt-3 space-y-2">
                  {testResults.telegram && (
                    <div className={`rounded-md px-3 py-2 text-xs ${
                      testResults.telegram.success ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      <span className="font-medium">Telegram:</span> {testResults.telegram.message}
                    </div>
                  )}
                  
                  {/* WhatsApp результати видалено */}
                </div>
              )}
            </div>
          )}
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MessengerSettings;
