// src/components/EventDetailPage.tsx
// Modified: Remove tickets_url, location coordinates, accent_color dependencies and add summary fallback

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  Copy,
  Check,
  MessageCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fetchEventBySlug, Event, getEventSummary } from '@/lib/supabase';
import { Hero } from '@/components/ui/Hero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSEO } from '@/lib/hooks/useSEO';
import { getEventDetailSEO } from '@/lib/seo/page-seo';
import { generateEventSchema } from '@/lib/seo/structured-data';

const EventDetailPage: React.FC = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  // SEO - dynamically updates when event loads
  useSEO(
    event
      ? {
          ...getEventDetailSEO(event),
          structuredData: {
            type: 'Event',
            data: generateEventSchema({
              title: event.title,
              summary: event.summary,
              body: event.body,
              slug: event.slug,
              start_at: event.start_at,
              end_at: event.end_at,
              venue: event.venue,
              images: event.images,
            }),
          },
        }
      : {
          title: error ? 'Event Not Found' : 'Loading Event...',
          description: error || 'Loading event details from Supermal Karawaci',
        },
    event
      ? [
          { name: 'Home', url: '/' },
          { name: 'Events', url: '/event' },
          { name: event.title, url: `/event/${event.slug}` },
        ]
      : undefined
  );

  // Load event data
  useEffect(() => {
    if (slug) {
      loadEvent(slug);
    }
  }, [slug]);

  const loadEvent = async (eventSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      const eventData = await fetchEventBySlug(eventSlug);

      if (!eventData) {
        setError('Event not found');
        return;
      }

      setEvent(eventData);
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  // Format dates with proper timezone handling
  const formatEventDate = (dateString: string, showTime: boolean = true) => {
    try {
      const date = new Date(dateString);
      const formatString = showTime ? 'EEEE, MMMM d, yyyy • h:mm a' : 'EEEE, MMMM d, yyyy';
      return format(date, formatString);
    } catch {
      return dateString;
    }
  };

  const formatDateRange = useMemo(() => {
    if (!event) return '';
    
    const start = new Date(event.start_at);
    const end = event.end_at ? new Date(event.end_at) : null;
    
    if (!end) {
      return formatEventDate(event.start_at);
    }
    
    const isSameDay = start.toDateString() === end.toDateString();
    
    if (isSameDay) {
      return `${format(start, 'EEEE, MMMM d, yyyy')} • ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    }

    // end_at is guaranteed to be non-null here due to the !end check above
    return `${formatEventDate(event.start_at)} - ${formatEventDate(event.end_at!)}`;
  }, [event]);

  // Get event summary with fallback to body excerpt
  const eventSummary = useMemo(() => {
    return event ? getEventSummary(event) : '';
  }, [event]);

  // Share functionality
  const shareUrl = window.location.href;
  const shareText = event ? `${event.title} - ${eventSummary}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const generateCalendarLink = () => {
    if (!event) return '';
    
    const start = new Date(event.start_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = event.end_at 
      ? new Date(event.end_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      : start;
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${start}/${end}`,
      details: eventSummary,
      location: event.venue || 'Supermal Karawaci'
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Image navigation
  const nextImage = () => {
    if (event && event.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
    }
  };

  const prevImage = () => {
    if (event && event.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
    }
  };

  // Check if content is HTML
  const isHtmlContent = (content: string): boolean => {
    const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
    return htmlTagPattern.test(content);
  };

  // Render markdown-like content
  const renderMarkdownBody = (body: string) => {
    // Simple markdown rendering
    return body.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mb-4 text-text-primary">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold mb-3 text-text-primary">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold mb-2 text-text-primary">{line.slice(4)}</h3>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-3 text-text-secondary leading-relaxed">{line}</p>;
    });
  };

  // Render event body - supports both HTML and markdown
  const renderEventBody = (body: string) => {
    if (isHtmlContent(body)) {
      // Render HTML content from WYSIWYG editor
      return (
        <div
          className="prose prose-invert max-w-none
            prose-headings:text-text-primary
            prose-p:text-text-secondary prose-p:leading-relaxed
            prose-strong:text-text-primary prose-strong:font-semibold
            prose-em:text-text-secondary
            prose-ul:text-text-secondary prose-ol:text-text-secondary
            prose-li:text-text-secondary
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      );
    }
    // Render markdown-like content
    return renderMarkdownBody(body);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">
              {error === 'Event not found' ? 'Event Not Found' : 'Error Loading Event'}
            </h1>
            <p className="text-text-secondary mb-8">
              {error === 'Event not found' 
                ? "The event you're looking for doesn't exist or has been removed."
                : 'We encountered an error while loading the event details.'}
            </p>
            <Link to="/event">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section with Event Details */}
      <Hero
        title={event.title}
        subtitle={formatDateRange}
        variant="compact"
        cta={
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(generateCalendarLink(), '_blank')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>

            {/* Share Actions - Side by side */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handleCopyLink}
                className="relative"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-success" />
                    <span className="text-success">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
              >
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Share
                </a>
              </Button>
            </div>
          </div>
        }
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/event"
            className="inline-flex items-center text-accent hover:text-accent-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {event.images && event.images.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-tertiary">
                  <img
                    src={event.images[currentImageIndex]?.url}
                    alt={event.images[currentImageIndex]?.alt || event.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Image Navigation */}
                  {event.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 hover:bg-surface rounded-full flex items-center justify-center text-text-primary hover:shadow-lg transition-all"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 hover:bg-surface rounded-full flex items-center justify-center text-text-primary hover:shadow-lg transition-all"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  {/* Image Caption */}
                  {event.images[currentImageIndex]?.caption && (
                    <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-sm rounded p-3">
                      <p className="text-sm text-text-secondary">
                        {event.images[currentImageIndex].caption}
                      </p>
                    </div>
                  )}
                </div>

                {/* Thumbnail Navigation */}
                {event.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {event.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex 
                            ? 'border-accent' 
                            : 'border-border-secondary hover:border-border-primary'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Event Body Content */}
            {event.body && (
              <div className="prose prose-lg max-w-none">
                {renderEventBody(event.body)}
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="bg-surface-secondary rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Event Details</h3>
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Date & Time</p>
                  <p className="text-sm text-text-secondary">{formatDateRange}</p>
                </div>
              </div>

              {event.venue && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary">Venue</p>
                    <p className="text-sm text-text-secondary">{event.venue}</p>
                  </div>
                </div>
              )}

              {event.timezone && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary">Timezone</p>
                    <p className="text-sm text-text-secondary">{event.timezone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => window.open(generateCalendarLink(), '_blank')}
                className="w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;