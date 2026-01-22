import { API_BASE_URL } from '../api';

export interface MessengerSettings {
  id: number;
  user_id: number;
  telegram_chat_id: string | null;
  telegram_username: string | null;
  notification_types: string[];
  created_at: string;
  updated_at: string;
  // WhatsApp поля залишені для сумісності з API
  whatsapp_number: string | null;
  whatsapp_verified: boolean;
  whatsapp_enabled: boolean;
}

// WhatsApp інтерфейси залишені для сумісності з API
export interface WhatsAppVerificationResponse {
  success: boolean;
  message: string;
}

export interface TelegramConnectResponse {
  success: boolean;
  message: string;
  deep_link: string;
}

export interface TestNotificationResult {
  success: boolean;
  results: {
    telegram: {
      success: boolean;
      message: string;
    };
    // WhatsApp результати залишені для сумісності з API
    whatsapp?: {
      success: boolean;
      message: string;
    };
  };
}

/**
 * Get messenger settings for the current user
 */
export async function getMessengerSettings(): Promise<MessengerSettings> {
  // Отримуємо токен або з prochepro_token, або з об'єкта користувача
  let token = localStorage.getItem('prochepro_token');
  
  if (!token) {
    // Спробуємо отримати токен з об'єкта користувача
    const userStr = localStorage.getItem('prochepro_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) {
          token = user.token;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/messenger/settings`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch messenger settings');
  }
  
  return response.json();
}

/**
 * Update messenger settings for the current user
 */
export async function updateMessengerSettings(settings: Partial<MessengerSettings>): Promise<MessengerSettings> {
  // Отримуємо токен або з prochepro_token, або з об'єкта користувача
  let token = localStorage.getItem('prochepro_token');
  
  if (!token) {
    // Спробуємо отримати токен з об'єкта користувача
    const userStr = localStorage.getItem('prochepro_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) {
          token = user.token;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/messenger/settings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update messenger settings');
  }
  
  return response.json();
}

/**
 * Start WhatsApp verification process - функція видалена
 */
// export async function startWhatsAppVerification - функцію видалено

/**
 * Complete WhatsApp verification with code - функція видалена
 */
// export async function completeWhatsAppVerification - функцію видалено

/**
 * Connect Telegram account with username
 */
export async function connectTelegram(telegramUsername: string): Promise<TelegramConnectResponse> {
  // Отримуємо токен або з prochepro_token, або з об'єкта користувача
  let token = localStorage.getItem('prochepro_token');
  
  if (!token) {
    // Спробуємо отримати токен з об'єкта користувача
    const userStr = localStorage.getItem('prochepro_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) {
          token = user.token;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/messenger/telegram/connect`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ telegram_username: telegramUsername }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to connect Telegram account');
  }
  
  return response.json();
}

/**
 * Connect Telegram account directly without username
 */
export async function connectTelegramDirect(): Promise<TelegramConnectResponse> {
  // Отримуємо токен або з prochepro_token, або з об'єкта користувача
  let token = localStorage.getItem('prochepro_token');
  
  if (!token) {
    // Спробуємо отримати токен з об'єкта користувача
    const userStr = localStorage.getItem('prochepro_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) {
          token = user.token;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/messenger/telegram/connect-direct`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to connect Telegram account');
  }
  
  return response.json();
}

/**
 * Test notifications
 */
export async function testNotification(): Promise<TestNotificationResult> {
  // Отримуємо токен або з prochepro_token, або з об'єкта користувача
  let token = localStorage.getItem('prochepro_token');
  
  if (!token) {
    // Спробуємо отримати токен з об'єкта користувача
    const userStr = localStorage.getItem('prochepro_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) {
          token = user.token;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/messenger/test`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to test notifications');
  }
  
  return response.json();
}
