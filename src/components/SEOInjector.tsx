// src/components/SEOInjector.tsx
// SEO Injector - Uses context for settings (NO direct fetching)
// NOTE: Backend SEO settings (title, description) are ONLY applied to homepage.
// Other pages use the useSEO hook for their own titles.

import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings, type CustomScript } from '../lib/context/SiteSettingsContext';

interface SEOInjectorProps {
    pageMeta?: {
        title?: string;
        description?: string;
        ogImage?: string;
        canonical?: string;
        keywords?: string[];
    };
}

/**
 * SEOInjector Component
 *
 * Reads site settings from context and injects them into the document.
 * IMPORTANT: Does NOT fetch directly - uses SiteSettingsProvider context.
 *
 * Supports:
 * - Meta tags in <head>
 * - Scripts (analytics, pixels, GTM)
 * - JSON-LD structured data
 * - Custom HTML (noscript tags for GTM)
 */
export default function SEOInjector({ pageMeta }: SEOInjectorProps) {
    const { settings, isLoading } = useSiteSettings();
    const location = useLocation();

    // Track injected body elements for cleanup
    const injectedElementsRef = useRef<Element[]>([]);

    // Check if we're on the homepage
    const isHomepage = location.pathname === '/';

    // Get settings from context
    const seoSettings = settings?.seo;
    const scripts = settings?.scripts;
    const generalSettings = settings?.general;

    /**
     * Inject body elements (scripts, noscript tags for GTM)
     */
    useEffect(() => {
        if (isLoading || !scripts) return;

        const elementsToCleanup: Element[] = [];

        // Helper to inject content into body
        const injectIntoBody = (script: CustomScript, prepend: boolean) => {
            if (!script.value) return;

            // Check if already injected
            if (document.querySelector(`[data-seo-setting="${script.key}"]`)) {
                return;
            }

            if (script.setting_type === 'script') {
                const el = document.createElement('script');
                el.setAttribute('data-seo-setting', script.key);
                el.innerHTML = script.value;

                if (prepend) {
                    document.body.insertBefore(el, document.body.firstChild);
                } else {
                    document.body.appendChild(el);
                }

                elementsToCleanup.push(el);
            } else if (script.setting_type === 'custom_html') {
                const container = document.createElement('div');
                container.setAttribute('data-seo-setting', script.key);
                container.style.display = 'contents';
                container.innerHTML = script.value;

                if (prepend) {
                    document.body.insertBefore(container, document.body.firstChild);
                } else {
                    document.body.appendChild(container);
                }

                elementsToCleanup.push(container);
            }
        };

        // Inject body_start elements
        scripts.body_start.forEach((script) => injectIntoBody(script, true));

        // Inject body_end elements
        scripts.body_end.forEach((script) => injectIntoBody(script, false));

        injectedElementsRef.current = elementsToCleanup;

        // Cleanup on unmount
        return () => {
            injectedElementsRef.current.forEach((el) => {
                try {
                    el.remove();
                } catch {
                    // Element may already be removed
                }
            });
            injectedElementsRef.current = [];
        };
    }, [isLoading, scripts]);

    /**
     * Inject head scripts via DOM (for meta_tag and custom_html types)
     * Helmet doesn't support <div> elements, so we inject manually
     */
    useEffect(() => {
        if (isLoading || !scripts) return;

        const headElements: Element[] = [];

        const injectIntoHead = (script: CustomScript) => {
            if (!script.value) return;

            // Check if already injected
            if (document.querySelector(`[data-head-setting="${script.key}"]`)) {
                return;
            }

            if (script.setting_type === 'meta_tag' || script.setting_type === 'custom_html') {
                // Create a temporary container to parse the HTML
                const temp = document.createElement('div');
                temp.innerHTML = script.value;

                // Move all child elements to head
                while (temp.firstChild) {
                    const child = temp.firstChild as Element;
                    if (child.setAttribute) {
                        child.setAttribute('data-head-setting', script.key);
                    }
                    document.head.appendChild(child);
                    if (child.nodeType === 1) { // Element node
                        headElements.push(child);
                    }
                }
            }
        };

        // Inject head_start and head_end custom HTML/meta elements
        scripts.head_start.forEach(injectIntoHead);
        scripts.head_end.forEach(injectIntoHead);

        // Cleanup on unmount
        return () => {
            headElements.forEach((el) => {
                try {
                    el.remove();
                } catch {
                    // Element may already be removed
                }
            });
        };
    }, [isLoading, scripts]);

    /**
     * Render a custom script for head injection (Helmet-compatible elements only)
     */
    const renderScript = (script: CustomScript): React.ReactNode => {
        if (!script.value) return null;

        switch (script.setting_type) {
            // meta_tag and custom_html are handled via DOM injection above
            case 'meta_tag':
            case 'custom_html':
                return null;

            case 'script':
                return (
                    <script
                        key={script.id}
                        dangerouslySetInnerHTML={{ __html: script.value }}
                    />
                );

            case 'link':
                return <link key={script.id} rel="stylesheet" href={script.value} />;

            case 'json_ld':
                return (
                    <script
                        key={script.id}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: script.value }}
                    />
                );

            default:
                return null;
        }
    };

    // Compute final SEO values
    // IMPORTANT: Backend SEO title/description ONLY applies to homepage.
    // Other pages use their own useSEO hook, so we skip title/description here.
    const title = pageMeta?.title || (isHomepage ? seoSettings?.meta_title : undefined);
    const description = pageMeta?.description || (isHomepage ? seoSettings?.meta_description : undefined);
    const ogImage = pageMeta?.ogImage || seoSettings?.og_image_url || '';
    const canonical = pageMeta?.canonical || (isHomepage ? seoSettings?.canonical_url : undefined);
    const keywords = pageMeta?.keywords?.join(', ') || (isHomepage ? seoSettings?.meta_keywords : undefined);
    const robots = seoSettings?.robots || 'index, follow';
    const ogTitle = isHomepage ? (seoSettings?.og_title || title) : undefined;
    const ogDescription = isHomepage ? (seoSettings?.og_description || description) : undefined;
    const ogType = seoSettings?.og_type || 'website';
    const twitterCard = seoSettings?.twitter_card || 'summary_large_image';
    const twitterSite = seoSettings?.twitter_site || '';
    const twitterCreator = seoSettings?.twitter_creator || '';

    // General settings (favicon, site name)
    const siteName = generalSettings?.site_name || 'Supermal Karawaci';
    const faviconUrl = generalSettings?.favicon_url || '/vite.svg';

    return (
        <Helmet>
            {/* Default meta tags */}
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Page title - only set on homepage, other pages use useSEO hook */}
            {title && <title>{title}</title>}

            {/* Meta description - only set on homepage */}
            {description && <meta name="description" content={description} />}

            {/* Robots directive */}
            <meta name="robots" content={robots} />

            {/* Keywords - only set on homepage */}
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Canonical URL - only set on homepage */}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Favicon from General Settings - applies to all pages */}
            <link rel="icon" type="image/x-icon" href={faviconUrl} />

            {/* Open Graph tags - only set on homepage */}
            {isHomepage && (
                <>
                    <meta property="og:type" content={ogType} />
                    <meta property="og:site_name" content={siteName} />
                    <meta property="og:locale" content="id_ID" />
                    {ogTitle && <meta property="og:title" content={ogTitle} />}
                    {ogDescription && <meta property="og:description" content={ogDescription} />}
                    {canonical && <meta property="og:url" content={canonical} />}
                    {ogImage && <meta property="og:image" content={ogImage} />}
                </>
            )}

            {/* Twitter Card tags - only set on homepage */}
            {isHomepage && (
                <>
                    <meta name="twitter:card" content={twitterCard} />
                    {ogTitle && <meta name="twitter:title" content={ogTitle} />}
                    {ogDescription && <meta name="twitter:description" content={ogDescription} />}
                    {twitterSite && <meta name="twitter:site" content={twitterSite} />}
                    {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
                    {ogImage && <meta name="twitter:image" content={ogImage} />}
                </>
            )}

            {/* Site verification tags - applies to all pages */}
            {seoSettings?.google_site_verification && (
                <meta name="google-site-verification" content={seoSettings.google_site_verification} />
            )}
            {seoSettings?.bing_site_verification && (
                <meta name="msvalidate.01" content={seoSettings.bing_site_verification} />
            )}

            {/* Custom scripts for head - applies to all pages */}
            {!isLoading && scripts && (
                <>
                    {scripts.head_start.map(renderScript)}
                    {scripts.head_end.map(renderScript)}
                </>
            )}
        </Helmet>
    );
}

/**
 * HOC to wrap any page component with SEO injection
 */
export function withSEO<P extends object>(
    Component: React.ComponentType<P>,
    seoMeta?: SEOInjectorProps['pageMeta']
) {
    return function WithSEOComponent(props: P) {
        return (
            <>
                <SEOInjector pageMeta={seoMeta} />
                <Component {...props} />
            </>
        );
    };
}
