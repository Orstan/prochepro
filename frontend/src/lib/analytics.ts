import { apiFetch, apiUrl } from './api';

export interface AnalyticsEvent {
  event_type: string;
  event_category: string;
  event_data?: Record<string, any>;
  session_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface BusinessAnalytics {
  period: string;
  profile_views: {
    total: number;
    unique_viewers: number;
    by_day: Array<{ date: string; count: number }>;
  };
  offers: {
    total: number;
    accepted: number;
    conversion_rate: number;
  };
  tasks: {
    completed: number;
  };
  revenue: {
    total: number;
    average_per_task: number;
  };
  top_referrers: Array<{ referrer: string; count: number }>;
}

export interface DemandForecast {
  historical_data: Array<{ date: string; count: number }>;
  forecast: Array<{ date: string; predicted_tasks: number }>;
  trend: 'growing' | 'declining' | 'stable';
  confidence: number;
  average_daily_tasks: number;
}

export interface CampaignAnalytics {
  period: string;
  campaigns: Array<{
    campaign: string;
    clicks: number;
    unique_users: number;
    conversions: number;
    conversion_rate: number;
    sources: Record<string, number>;
    mediums: Record<string, number>;
  }>;
  total_clicks: number;
  total_campaigns: number;
}

export interface AbTestVariant {
  test_key: string;
  variant: string;
}

export interface AbTestResults {
  test: {
    id: number;
    name: string;
    key: string;
    description?: string;
    variants: string[];
    is_active: boolean;
  };
  variant_stats: Record<string, {
    assignments: number;
    conversions: number;
    conversion_rate: number;
  }>;
  overall: {
    total_assignments: number;
    total_conversions: number;
    conversion_rate: number;
  };
}

class AnalyticsService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private getUtmParams(): Record<string, string | undefined> {
    if (typeof window === 'undefined') return {};
    
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined,
    };
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const utmParams = this.getUtmParams();
      await apiFetch('/api/analytics/track-event', {
        method: 'POST',
        body: JSON.stringify({
          ...event,
          session_id: this.sessionId,
          ...utmParams,
        }),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async trackProfileView(profileUserId: number): Promise<void> {
    try {
      await apiFetch(`/api/analytics/track-profile-view/${profileUserId}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to track profile view:', error);
    }
  }

  async getBusinessAnalytics(period: string = '30days'): Promise<BusinessAnalytics> {
    return await apiFetch<BusinessAnalytics>(`/api/analytics/business?period=${period}`);
  }

  async getDemandForecast(category?: string, daysAhead: number = 30): Promise<DemandForecast> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('days_ahead', daysAhead.toString());
    return await apiFetch<DemandForecast>(`/api/analytics/demand-forecast?${params.toString()}`);
  }

  async getCampaignAnalytics(period: string = '30days'): Promise<CampaignAnalytics> {
    return await apiFetch<CampaignAnalytics>(`/api/analytics/campaigns?period=${period}`);
  }

  async getAbTestVariant(testKey: string): Promise<string> {
    const response = await apiFetch<{ variant: string }>(
      `/api/ab-test/${testKey}/variant?session_id=${this.sessionId}`
    );
    return response.variant;
  }

  async trackAbTestConversion(
    testKey: string,
    conversionType: string,
    conversionData?: Record<string, any>
  ): Promise<void> {
    try {
      await apiFetch(`/api/ab-test/${testKey}/conversion`, {
        method: 'POST',
        body: JSON.stringify({
          session_id: this.sessionId,
          conversion_type: conversionType,
          conversion_data: conversionData,
        }),
      });
    } catch (error) {
      console.error('Failed to track A/B test conversion:', error);
    }
  }

  async createAbTest(data: {
    name: string;
    key: string;
    description?: string;
    variants: string[];
  }): Promise<any> {
    return await apiFetch('/api/admin/ab-tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAbTestResults(testId: number): Promise<AbTestResults> {
    return await apiFetch<AbTestResults>(`/api/admin/ab-tests/${testId}/results`);
  }

  async endAbTest(testId: number): Promise<any> {
    return await apiFetch(`/api/admin/ab-tests/${testId}/end`, {
      method: 'POST',
    });
  }
}

export const analyticsService = new AnalyticsService();
