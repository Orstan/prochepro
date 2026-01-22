// Meta Pixel helper functions for tracking conversions

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

export const META_PIXEL_ID = '2001443470711775';

// Track page view (already done in layout.tsx, but can be used for SPA navigation)
export function trackPageView() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
}

// Track user registration
export function trackCompleteRegistration(value?: number, currency = 'EUR') {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      value: value || 0,
      currency,
    });
  }
}

// Track when user starts checkout (clicks buy credits)
export function trackInitiateCheckout(value: number, currency = 'EUR', contentName?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value,
      currency,
      content_name: contentName,
    });
  }
}

// Track successful purchase
export function trackPurchase(value: number, currency = 'EUR', contentName?: string, contentId?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value,
      currency,
      content_name: contentName,
      content_ids: contentId ? [contentId] : undefined,
      content_type: 'product',
    });
  }
}

// Track when user views content (e.g., pricing page)
export function trackViewContent(contentName: string, contentCategory?: string, value?: number) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      content_category: contentCategory,
      value: value || 0,
      currency: 'EUR',
    });
  }
}

// Track lead generation (e.g., task creation)
export function trackLead(value?: number, currency = 'EUR') {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      value: value || 0,
      currency,
    });
  }
}

// Track contact (e.g., sending first message)
export function trackContact() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Contact');
  }
}

// Custom event tracking
export function trackCustomEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
}
