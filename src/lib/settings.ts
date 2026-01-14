// src/lib/settings.ts
// Site settings helpers for fetching grouped settings from Supabase
// IMPORTANT: Uses a SINGLE query to fetch all settings to avoid multiple requests

import { supabase } from './supabase';

// Types for grouped settings
export interface SeoSettings {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  og_type: 'website' | 'business.business' | 'place';
  twitter_card: 'summary' | 'summary_large_image';
  twitter_site: string;
  twitter_creator: string;
  canonical_url: string;
  robots: string;
  google_site_verification: string;
  bing_site_verification: string;
}

export interface AnalyticsSettings {
  google_analytics_id: string;
  google_tag_manager_id: string;
  meta_pixel_id: string;
  tiktok_pixel_id: string;
  hotjar_id: string;
}

export interface GeneralSettings {
  site_name: string;
  site_tagline: string;
  site_description: string;
  logo_url: string;
  logo_dark_url: string;
  favicon_url: string;
  default_language: string;
  timezone: string;
}

export interface ContactSettings {
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  google_maps_embed: string;
  latitude: string;
  longitude: string;
}

export interface SocialSettings {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
}

export interface CustomScript {
  id: string;
  key: string;
  display_name: string;
  value: string;
  setting_type: 'meta_tag' | 'script' | 'link' | 'json_ld' | 'custom_html';
  injection_point: 'head_start' | 'head_end' | 'body_start' | 'body_end';
  sort_order: number;
}

export interface AllSiteSettings {
  seo: SeoSettings;
  analytics: AnalyticsSettings;
  general: GeneralSettings;
  contact: ContactSettings;
  social: SocialSettings;
  scripts: {
    head_start: CustomScript[];
    head_end: CustomScript[];
    body_start: CustomScript[];
    body_end: CustomScript[];
  };
}

// Default values
const DEFAULT_SEO: SeoSettings = {
  meta_title: 'Supermal Karawaci',
  meta_description: 'Shopping Mall in Tangerang',
  meta_keywords: '',
  og_title: '',
  og_description: '',
  og_image_url: '',
  og_type: 'website',
  twitter_card: 'summary_large_image',
  twitter_site: '',
  twitter_creator: '',
  canonical_url: 'https://supermalkarawaci.co.id',
  robots: 'index, follow',
  google_site_verification: '',
  bing_site_verification: '',
};

const DEFAULT_ANALYTICS: AnalyticsSettings = {
  google_analytics_id: '',
  google_tag_manager_id: '',
  meta_pixel_id: '',
  tiktok_pixel_id: '',
  hotjar_id: '',
};

const DEFAULT_GENERAL: GeneralSettings = {
  site_name: 'Supermal Karawaci',
  site_tagline: '',
  site_description: '',
  logo_url: '',
  logo_dark_url: '',
  favicon_url: '',
  default_language: 'id',
  timezone: 'Asia/Jakarta',
};

const DEFAULT_CONTACT: ContactSettings = {
  address: '',
  phone: '',
  email: '',
  whatsapp: '',
  google_maps_embed: '',
  latitude: '',
  longitude: '',
};

const DEFAULT_SOCIAL: SocialSettings = {
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  tiktok: '',
  linkedin: '',
};

// Cache for all settings
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let settingsCache: { data: AllSiteSettings; timestamp: number } | null = null;

// Request deduplication - prevent multiple simultaneous fetches
let pendingRequest: Promise<AllSiteSettings> | null = null;

/**
 * Parse a JSON value safely
 */
function parseJsonValue<T>(value: string | null | undefined, defaults: T): T {
  if (!value) return defaults;
  try {
    const parsed = JSON.parse(value);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

/**
 * Fetch ALL site settings in a SINGLE query
 * This is the main function that should be called
 */
export async function fetchAllSiteSettings(): Promise<AllSiteSettings> {
  // Return cached data if valid
  if (settingsCache && Date.now() - settingsCache.timestamp < CACHE_DURATION) {
    return settingsCache.data;
  }

  // If there's already a pending request, wait for it (deduplication)
  if (pendingRequest) {
    return pendingRequest;
  }

  // Create new request
  pendingRequest = (async () => {
    try {
      // SINGLE query to fetch ALL settings
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Failed to fetch site settings:', error);
        return getDefaultSettings();
      }

      // Parse the results
      const settings = parseSettingsFromData(data || []);

      // Cache the results
      settingsCache = {
        data: settings,
        timestamp: Date.now(),
      };

      return settings;
    } catch (error) {
      console.error('Error fetching site settings:', error);
      return getDefaultSettings();
    } finally {
      pendingRequest = null;
    }
  })();

  return pendingRequest;
}

/**
 * Parse raw database data into structured settings
 */
function parseSettingsFromData(data: Array<{
  key: string;
  value: string | null;
  setting_type?: string;
  injection_point?: string;
  id?: string;
  display_name?: string;
  sort_order?: number;
}>): AllSiteSettings {
  const settings: AllSiteSettings = {
    seo: { ...DEFAULT_SEO },
    analytics: { ...DEFAULT_ANALYTICS },
    general: { ...DEFAULT_GENERAL },
    contact: { ...DEFAULT_CONTACT },
    social: { ...DEFAULT_SOCIAL },
    scripts: {
      head_start: [],
      head_end: [],
      body_start: [],
      body_end: [],
    },
  };

  for (const row of data) {
    const { key, value, setting_type, injection_point, id, display_name, sort_order } = row;

    // Handle grouped settings (stored as JSON in value column)
    switch (key) {
      case 'settings_seo':
        settings.seo = parseJsonValue(value, DEFAULT_SEO);
        break;
      case 'settings_analytics':
        settings.analytics = parseJsonValue(value, DEFAULT_ANALYTICS);
        break;
      case 'settings_general':
        settings.general = parseJsonValue(value, DEFAULT_GENERAL);
        break;
      case 'settings_contact':
        settings.contact = parseJsonValue(value, DEFAULT_CONTACT);
        break;
      case 'settings_social':
        settings.social = parseJsonValue(value, DEFAULT_SOCIAL);
        break;
      default:
        // Handle custom scripts (not grouped settings)
        if (!key.startsWith('settings_') && injection_point && setting_type && value) {
          const script: CustomScript = {
            id: id || key,
            key,
            display_name: display_name || key,
            value,
            setting_type: setting_type as CustomScript['setting_type'],
            injection_point: injection_point as CustomScript['injection_point'],
            sort_order: sort_order || 0,
          };

          switch (injection_point) {
            case 'head_start':
              settings.scripts.head_start.push(script);
              break;
            case 'head_end':
              settings.scripts.head_end.push(script);
              break;
            case 'body_start':
              settings.scripts.body_start.push(script);
              break;
            case 'body_end':
              settings.scripts.body_end.push(script);
              break;
          }
        }
        break;
    }
  }

  return settings;
}

/**
 * Get default settings (used when fetch fails)
 */
function getDefaultSettings(): AllSiteSettings {
  return {
    seo: { ...DEFAULT_SEO },
    analytics: { ...DEFAULT_ANALYTICS },
    general: { ...DEFAULT_GENERAL },
    contact: { ...DEFAULT_CONTACT },
    social: { ...DEFAULT_SOCIAL },
    scripts: {
      head_start: [],
      head_end: [],
      body_start: [],
      body_end: [],
    },
  };
}

/**
 * Clear settings cache (useful after updates)
 */
export function clearSettingsCache(): void {
  settingsCache = null;
  pendingRequest = null;
}

// Re-export types for convenience
export type { AllSiteSettings as SiteSettings };
