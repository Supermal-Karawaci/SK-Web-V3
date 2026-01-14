// src/lib/context/SiteSettingsContext.tsx
// React context for site settings - SINGLE SOURCE OF TRUTH
// Uses ONE query to fetch all settings to avoid multiple requests

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  fetchAllSiteSettings,
  clearSettingsCache,
  type AllSiteSettings,
  type SeoSettings,
  type AnalyticsSettings,
  type GeneralSettings,
  type ContactSettings,
  type SocialSettings,
  type CustomScript,
} from '../settings';

interface SiteSettingsContextValue {
  settings: AllSiteSettings | null;
  isLoading: boolean;
  error: Error | null;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: null,
  isLoading: true,
  error: null,
  refreshSettings: async () => {},
});

interface SiteSettingsProviderProps {
  children: React.ReactNode;
}

/**
 * SiteSettingsProvider
 *
 * Provides site settings from Supabase to the entire app via React context.
 * Uses a SINGLE query to fetch ALL settings at once.
 * This is the ONLY place that should fetch settings.
 */
export function SiteSettingsProvider({ children }: SiteSettingsProviderProps) {
  const [settings, setSettings] = useState<AllSiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // SINGLE fetch for ALL settings
      const allSettings = await fetchAllSiteSettings();
      setSettings(allSettings);
    } catch (err) {
      console.error('Failed to load site settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    clearSettingsCache();
    await loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        refreshSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

/**
 * Hook to access all site settings from context
 */
export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}

/**
 * Hook to access SEO settings specifically
 */
export function useSeoSettings(): { seoSettings: SeoSettings | null; isLoading: boolean } {
  const { settings, isLoading } = useSiteSettings();
  return { seoSettings: settings?.seo ?? null, isLoading };
}

/**
 * Hook to access analytics settings specifically
 */
export function useAnalyticsSettings(): { analyticsSettings: AnalyticsSettings | null; isLoading: boolean } {
  const { settings, isLoading } = useSiteSettings();
  return { analyticsSettings: settings?.analytics ?? null, isLoading };
}

/**
 * Hook to access general settings specifically
 */
export function useGeneralSettings(): { generalSettings: GeneralSettings | null; isLoading: boolean } {
  const { settings, isLoading } = useSiteSettings();
  return { generalSettings: settings?.general ?? null, isLoading };
}

/**
 * Hook to access contact settings specifically
 */
export function useContactSettings(): { contactSettings: ContactSettings | null; isLoading: boolean } {
  const { settings, isLoading } = useSiteSettings();
  return { contactSettings: settings?.contact ?? null, isLoading };
}

/**
 * Hook to access social settings specifically
 */
export function useSocialSettings(): { socialSettings: SocialSettings | null; isLoading: boolean } {
  const { settings, isLoading } = useSiteSettings();
  return { socialSettings: settings?.social ?? null, isLoading };
}

/**
 * Hook to access custom scripts
 */
export function useCustomScripts(): {
  scripts: AllSiteSettings['scripts'] | null;
  isLoading: boolean;
} {
  const { settings, isLoading } = useSiteSettings();
  return { scripts: settings?.scripts ?? null, isLoading };
}

// Re-export types
export type {
  AllSiteSettings,
  SeoSettings,
  AnalyticsSettings,
  GeneralSettings,
  ContactSettings,
  SocialSettings,
  CustomScript,
};

export default SiteSettingsContext;
