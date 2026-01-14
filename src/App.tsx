// src/App.tsx
// Modified: Added MoviesPage route for XXI Cinema showtime display

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// SEO
import { useSEO } from './lib/hooks/useSEO';
import { PAGE_SEO } from './lib/seo/page-seo';
import {
  ORGANIZATION_SCHEMA,
  LOCAL_BUSINESS_SCHEMA,
  WEBSITE_SCHEMA,
} from './lib/seo/seo-config';

// Public Website Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import FeaturedTenants from './components/FeaturedTenants';
import Events from './components/Events';
import FoodDining from './components/FoodDining';
import Facilities from './components/Facilities';
import VisitorInfo from './components/VisitorInfo';
import Footer from './components/Footer';

// Page Components
import MallDirectory from './components/MallDirectory';
import PromotionsPage from './components/PromotionsPage';
import ContactPage from './components/ContactPage';
import VIPCardsPage from './components/VIPCardsPage';
import EventsPage from './components/EventsPage';
import EventDetailPage from './components/EventDetailPage';
import BlogPage from './components/BlogPage';
import PostDetailPage from './components/PostDetailPage';
import MoviesPage from './components/MoviesPage'; // NEW: Movies showtime page
import NotFoundPage from './components/NotFoundPage'; // 404 Page

// Admin Components
import SEOInjector from './components/SEOInjector';
import Analytics from './components/Analytics';

// Site Settings Provider
import { SiteSettingsProvider } from './lib/context/SiteSettingsContext';



// Layout Component for consistent navbar/footer
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        {children}
      </div>
      <Footer />
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface-secondary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-accent)',
              secondary: 'var(--color-text-inverse)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'var(--color-text-inverse)',
            },
          },
        }}
      />
    </div>
  );
};

// Main Website Homepage Component
const PublicWebsite: React.FC = () => {
  // Homepage SEO with Organization, LocalBusiness, and WebSite schemas
  useSEO({
    ...PAGE_SEO.home,
    structuredData: [
      { type: 'Organization', data: ORGANIZATION_SCHEMA },
      { type: 'LocalBusiness', data: LOCAL_BUSINESS_SCHEMA },
      { type: 'WebSite', data: WEBSITE_SCHEMA },
    ],
  });

  return (
    <>
      <Hero />
      <FeaturedTenants />
      <Events />
      <FoodDining />
      <Facilities />
      <VisitorInfo />
      <About />
    </>
  );
};

// Main App Component
function App() {
  return (
    <SiteSettingsProvider>
      <Router>
        <SEOInjector />
        <Analytics />
        <Routes>
        {/* Homepage */}
        <Route
          path="/"
          element={
            <Layout>
              <PublicWebsite />
            </Layout>
          }
        />

        {/* Mall Directory Page */}
        <Route
          path="/directory"
          element={
            <Layout>
              <MallDirectory />
            </Layout>
          }
        />

        {/* Promotions Page */}
        <Route
          path="/promotions"
          element={
            <Layout>
              <PromotionsPage />
            </Layout>
          }
        />

        {/* Contact Page */}
        <Route
          path="/contact"
          element={
            <Layout>
              <ContactPage />
            </Layout>
          }
        />

        {/* VIP Cards Page */}
        <Route
          path="/vip-cards"
          element={
            <Layout>
              <VIPCardsPage />
            </Layout>
          }
        />

        {/* Events Page */}
        <Route
          path="/event"
          element={
            <Layout>
              <EventsPage />
            </Layout>
          }
        />

        {/* Event Detail Page */}
        <Route
          path="/event/:slug"
          element={
            <Layout>
              <EventDetailPage />
            </Layout>
          }
        />

        {/* Blog Page */}
        <Route
          path="/blog"
          element={
            <Layout>
              <BlogPage />
            </Layout>
          }
        />

        {/* Blog Detail Page */}
        <Route
          path="/blog/:slug"
          element={
            <Layout>
              <PostDetailPage />
            </Layout>
          }
        />

        {/* NEW: Movies Showtime Page */}
        <Route
          path="/movies"
          element={
            <Layout>
              <MoviesPage />
            </Layout>
          }
        />

        {/* 404 Not Found Page */}
        <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </Router>
    </SiteSettingsProvider>
  );
}

export default App;