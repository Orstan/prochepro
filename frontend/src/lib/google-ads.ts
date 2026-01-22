// Google Ads conversion tracking helper functions

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export const GOOGLE_ADS_ID = 'AW-17836471073';
export const GOOGLE_ADS_ID_REGISTER = 'AW-17868549005';

/**
 * Відстеження конверсії реєстрації для всіх шляхів реєстрації
 * Ця функція викликається після успішної реєстрації користувача
 */
export function trackRegistrationConversion() {
  if (typeof window !== 'undefined' && window.gtag) {
    // Відстеження конверсії для першого тегу
    window.gtag('event', 'conversion', {
      'send_to': 'AW-17836471073/IO4HCPrU0tgbEKHmi7lC'
    });
    
    // Відстеження конверсії для нового тегу реєстрації
    window.gtag('event', 'conversion', {
      'send_to': `${GOOGLE_ADS_ID_REGISTER}`
    });
    
    // Додаткове відстеження події реєстрації як загальної події
    window.gtag('event', 'sign_up', {
      'method': 'email'
    });
  }
}

/**
 * Відстеження відвідування сторінки реєстрації
 * Цю функцію можна викликати на будь-якій сторінці реєстрації
 */
export function trackRegisterPageView() {
  if (typeof window !== 'undefined' && window.gtag) {
    // Відстеження перегляду сторінки реєстрації для нового тегу
    window.gtag('event', 'page_view', {
      'send_to': GOOGLE_ADS_ID_REGISTER
    });
  }
}

// Track purchase conversion (for future use)
export function trackPurchaseConversion(value: number, currency = 'EUR', transactionId?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': 'AW-17836471073/CONVERSION_LABEL', // Replace with actual conversion label
      'value': value,
      'currency': currency,
      'transaction_id': transactionId
    });
  }
}

// Track custom conversion
export function trackCustomConversion(conversionLabel: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `${GOOGLE_ADS_ID}/${conversionLabel}`,
      ...params
    });
  }
}
