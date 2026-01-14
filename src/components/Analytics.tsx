// src/components/Analytics.tsx
// Analytics tracking scripts injection component
// IMPORTANT: Uses context - does NOT fetch directly

import { useEffect, useRef } from 'react';
import { useAnalyticsSettings } from '../lib/context/SiteSettingsContext';

/**
 * Analytics Component
 *
 * Reads analytics settings from context and injects tracking scripts:
 * - Google Analytics 4 (GA4)
 * - Google Tag Manager (GTM)
 * - Meta (Facebook) Pixel
 * - TikTok Pixel
 * - Hotjar
 *
 * IMPORTANT: Does NOT fetch directly - uses SiteSettingsProvider context.
 */
export default function Analytics() {
  const { analyticsSettings: analytics, isLoading } = useAnalyticsSettings();
  const injectedScriptsRef = useRef<HTMLScriptElement[]>([]);
  const hasInjectedRef = useRef(false);

  // Inject analytics scripts when settings are loaded
  useEffect(() => {
    // Skip if still loading or already injected
    if (isLoading || !analytics || hasInjectedRef.current) return;

    const scriptsToCleanup: HTMLScriptElement[] = [];

    // Helper function to inject a script
    const injectScript = (
      id: string,
      content: string,
      options?: { src?: string; async?: boolean }
    ) => {
      // Check if script already exists
      if (document.getElementById(id)) return;

      const script = document.createElement('script');
      script.id = id;

      if (options?.src) {
        script.src = options.src;
        if (options.async) script.async = true;
      } else {
        script.innerHTML = content;
      }

      document.head.appendChild(script);
      scriptsToCleanup.push(script);
    };

    // Google Analytics 4
    if (analytics.google_analytics_id) {
      const gaId = analytics.google_analytics_id;

      // Load gtag.js
      injectScript(
        'ga4-loader',
        '',
        { src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`, async: true }
      );

      // Initialize GA4
      injectScript(
        'ga4-init',
        `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `
      );
    }

    // Google Tag Manager
    if (analytics.google_tag_manager_id) {
      const gtmId = analytics.google_tag_manager_id;

      injectScript(
        'gtm-init',
        `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `
      );

      // Also inject GTM noscript iframe into body
      if (!document.getElementById('gtm-noscript')) {
        const noscript = document.createElement('noscript');
        noscript.id = 'gtm-noscript';
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
        iframe.height = '0';
        iframe.width = '0';
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';
        noscript.appendChild(iframe);
        document.body.insertBefore(noscript, document.body.firstChild);
      }
    }

    // Meta (Facebook) Pixel
    if (analytics.meta_pixel_id) {
      const pixelId = analytics.meta_pixel_id;

      injectScript(
        'meta-pixel',
        `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `
      );

      // Add noscript pixel
      if (!document.getElementById('meta-pixel-noscript')) {
        const noscript = document.createElement('noscript');
        noscript.id = 'meta-pixel-noscript';
        const img = document.createElement('img');
        img.height = 1;
        img.width = 1;
        img.style.display = 'none';
        img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
        img.alt = '';
        noscript.appendChild(img);
        document.body.appendChild(noscript);
      }
    }

    // TikTok Pixel
    if (analytics.tiktok_pixel_id) {
      const tiktokId = analytics.tiktok_pixel_id;

      injectScript(
        'tiktok-pixel',
        `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${tiktokId}');
            ttq.page();
          }(window, document, 'ttq');
        `
      );
    }

    // Hotjar
    if (analytics.hotjar_id) {
      const hotjarId = analytics.hotjar_id;

      injectScript(
        'hotjar',
        `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${hotjarId},hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `
      );
    }

    injectedScriptsRef.current = scriptsToCleanup;
    hasInjectedRef.current = true;

    // Cleanup on unmount
    return () => {
      injectedScriptsRef.current.forEach((script) => {
        try {
          script.remove();
        } catch {
          // Script may already be removed
        }
      });
      injectedScriptsRef.current = [];
      hasInjectedRef.current = false;
    };
  }, [isLoading, analytics]);

  // This component doesn't render anything visible
  return null;
}
