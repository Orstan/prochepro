import { useEffect, useCallback } from 'react';
import { analyticsService } from '@/lib/analytics';

export function useAnalytics() {
  const trackEvent = useCallback((eventType: string, eventCategory: string, eventData?: Record<string, any>) => {
    analyticsService.trackEvent({
      event_type: eventType,
      event_category: eventCategory,
      event_data: eventData,
    });
  }, []);

  const trackPageView = useCallback((pageName: string) => {
    analyticsService.trackEvent({
      event_type: 'page_view',
      event_category: 'navigation',
      event_data: { page: pageName },
    });
  }, []);

  const trackProfileView = useCallback((profileUserId: number) => {
    analyticsService.trackProfileView(profileUserId);
  }, []);

  const trackClick = useCallback((element: string, location: string) => {
    analyticsService.trackEvent({
      event_type: 'click',
      event_category: 'interaction',
      event_data: { element, location },
    });
  }, []);

  const trackConversion = useCallback((conversionType: string, value?: number, data?: Record<string, any>) => {
    analyticsService.trackEvent({
      event_type: conversionType,
      event_category: 'conversion',
      event_data: { value, ...data },
    });
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackProfileView,
    trackClick,
    trackConversion,
  };
}

export function useAbTest(testKey: string) {
  const getVariant = useCallback(async () => {
    return await analyticsService.getAbTestVariant(testKey);
  }, [testKey]);

  const trackConversion = useCallback((conversionType: string, data?: Record<string, any>) => {
    analyticsService.trackAbTestConversion(testKey, conversionType, data);
  }, [testKey]);

  return {
    getVariant,
    trackConversion,
  };
}

export function usePageTracking(pageName: string) {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(pageName);
  }, [pageName, trackPageView]);
}
