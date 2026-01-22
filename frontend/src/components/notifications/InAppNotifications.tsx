'use client';

import { useState, useEffect } from 'react';
import { X, MessageCircle, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  title: string;
  body: string;
  url?: string;
  icon?: string;
  timestamp: number;
  read?: boolean;
}

export default function InAppNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePushNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail || {};
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        title: data.title || 'Nouvelle notification',
        body: data.body || '',
        url: data.url || '/',
        icon: data.icon,
        timestamp: Date.now(),
        read: false,
      };

      setNotifications(prev => [notification, ...prev]);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    window.addEventListener('push-notification-received', handlePushNotification);

    return () => {
      window.removeEventListener('push-notification-received', handlePushNotification);
    };
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.url) {
      router.push(notification.url);
    }
    markAsRead(notification.id);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  };

  const getIcon = (notification: Notification) => {
    if (notification.title.includes('Message')) return <MessageCircle size={20} />;
    if (notification.title.includes('Offre')) return <CheckCircle size={20} />;
    if (notification.title.includes('urgent')) return <AlertCircle size={20} />;
    return <Bell size={20} />;
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  if (!isVisible || unreadNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] max-w-sm w-full space-y-2 pointer-events-none">
      {unreadNotifications.slice(0, 3).map((notification, index) => (
        <div
          key={notification.id}
          className="pointer-events-auto animate-slideInRight bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden hover:shadow-3xl transition-all duration-300"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="flex items-start gap-3 p-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
              {getIcon(notification)}
            </div>

            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => handleNotificationClick(notification)}
            >
              <h4 className="text-sm font-bold text-gray-900 mb-1 truncate">
                {notification.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {notification.body}
              </p>
              <p className="text-[10px] text-gray-400 mt-1.5">
                {new Date(notification.timestamp).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissNotification(notification.id);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="h-1 bg-gradient-to-r from-sky-500 to-blue-600 animate-shrink origin-left"></div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrink {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out forwards;
        }

        .animate-shrink {
          animation: shrink 5s linear forwards;
        }
      `}</style>
    </div>
  );
}
