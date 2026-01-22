import { useEffect, useState } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkSupport = async () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      
      if (!isSupported) {
        setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        setState(prev => ({
          ...prev,
          isSupported: true,
          isSubscribed: !!subscription,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Error checking push subscription:', error);
        setState(prev => ({
          ...prev,
          isSupported: true,
          isLoading: false,
          error: 'Erreur lors de la vérification',
        }));
      }
    };

    checkSupport();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState(prev => ({ ...prev, error: 'Permission refusée' }));
      return false;
    }
  };

  const subscribe = async (): Promise<PushSubscription | null> => {
    if (!state.isSupported) return null;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setState(prev => ({ ...prev, isLoading: false, error: 'Permission non accordée' }));
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // VAPID public key - you need to generate this on backend
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey ? urlBase64ToUint8Array(vapidPublicKey) as any : undefined,
      });

      setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
      
      // Send subscription to backend
      await sendSubscriptionToBackend(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erreur d\'abonnement' 
      }));
      return null;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await removeSubscriptionFromBackend(subscription);
      }

      setState(prev => ({ ...prev, isSubscribed: false, isLoading: false }));
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erreur de désabonnement' 
      }));
      return false;
    }
  };

  const sendTestNotification = async () => {
    if (!state.isSubscribed) {
      console.warn('Not subscribed to push notifications');
      return;
    }

    try {
      const token = window.localStorage.getItem('prochepro_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push-notifications/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission,
    sendTestNotification,
  };
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
  try {
    const token = window.localStorage.getItem('prochepro_token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push-subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription.toJSON()),
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to backend');
    }
  } catch (error) {
    console.error('Error sending subscription to backend:', error);
  }
}

async function removeSubscriptionFromBackend(subscription: PushSubscription): Promise<void> {
  try {
    const token = window.localStorage.getItem('prochepro_token');
    const endpoint = subscription.endpoint;
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push-subscriptions`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove subscription from backend');
    }
  } catch (error) {
    console.error('Error removing subscription from backend:', error);
  }
}
