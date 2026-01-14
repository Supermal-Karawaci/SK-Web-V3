// src/components/ui/BlogSidebar.tsx
// Fixed: Added BlogCategoryWithCount type, removed unused imports

import React from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResponsiveImage } from './ResponsiveImage';
import BlogCategoryPill from './BlogCategoryPill';
import { cn } from '@/lib/utils';
import type { Post, BlogCategory } from '../../lib/supabase';

// Extended interface for categories with computed post count
interface BlogCategoryWithCount extends BlogCategory {
  post_count?: number;
}

interface BlogSidebarProps {
  featuredPosts?: Post[];
  categories?: BlogCategoryWithCount[];
  popularTags?: Array<{ name: string; count: number }>;
  selectedTags?: string[];
  onTagClick?: (tag: string) => void;
  onCategoryClick?: (categoryId: string) => void;
  onSubscribe?: (email: string) => void;
  className?: string;
  showAuthor?: boolean;
  authorName?: string;
  authorBio?: string;
  authorLocation?: string;
}

export default function BlogSidebar({
  featuredPosts = [],
  categories = [],
  popularTags = [],
  selectedTags = [],
  onTagClick,
  onCategoryClick,
  className = '',
  showAuthor = true,
  authorName = 'Supermal Karawaci',
  authorBio = 'Your premier shopping destination in Tangerang. Discover the latest trends, events, dining experiences, and lifestyle content from one of Indonesia\'s most iconic malls.',
  authorLocation = 'Tangerang, Indonesia'
}: BlogSidebarProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <aside className={cn('space-y-8', className)}>
      {/* Author Card */}
      {showAuthor && (
        <Card className="border-0 shadow-lg rounded-3xl bg-surface">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="w-20 h-20 border-4 border-accent/10">
                <AvatarImage src="/avatars/author.jpg" alt={authorName} />
                <AvatarFallback className="bg-accent text-text-inverse text-xl font-semibold">
                  {authorName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold text-lg text-text-primary">{authorName}</h3>
                </div>
                
                {authorLocation && (
                  <div className="flex items-center justify-center gap-1.5 text-text-muted">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-sm">{authorLocation}</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-text-secondary leading-relaxed">
                {authorBio}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest Posts */}
      {featuredPosts.length > 0 && (
        <Card className="border-0 shadow-lg rounded-3xl bg-surface">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-text-muted tracking-wider uppercase mb-6">LATEST POSTS</h3>
            
            <div className="space-y-6">
              {featuredPosts.slice(0, 3).map((post, index) => (
                <div key={post.id}>
                  {index === 0 ? (
                    // First featured post - large card
                    <Card className="border border-border-primary shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <Link to={`/blog/${post.slug}`} className="block group">
                          <ResponsiveImage
                            src={post.image_url || ''}
                            alt={post.title}
                            className="w-full h-32 object-cover"
                            aspectRatio="4/3"
                            loading="lazy"
                          />
                        </Link>
                        
                        <div className="p-4">
                          <Link to={`/blog/${post.slug}`}>
                            <h4 className="font-semibold text-sm text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight mb-2">
                              {post.title}
                            </h4>
                          </Link>
                          <p className="text-xs text-text-muted">
                            {formatDate(post.publish_at || post.created_at)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    // Other featured posts - compact
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group flex gap-3 hover:bg-surface-secondary rounded-xl p-2 transition-colors"
                    >
                      <ResponsiveImage
                        src={post.image_url || ''}
                        alt=""
                        className="w-16 h-12 flex-shrink-0 rounded-lg"
                        aspectRatio="4/3"
                        objectFit="cover"
                        loading="lazy"
                      />
                      
                      <div className="min-w-0 flex-1">
                        <h5 className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight mb-1">
                          {post.title}
                        </h5>
                        <p className="text-xs text-text-muted">
                          {formatDate(post.publish_at || post.created_at)}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <Card className="border-0 shadow-lg rounded-3xl bg-surface">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-text-muted tracking-wider uppercase mb-6">POPULAR TAGS</h3>

            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <BlogCategoryPill
                  key={tag.name}
                  name={tag.name}
                  count={tag.count}
                  selected={selectedTags.includes(tag.name)}
                  onClick={() => onTagClick?.(tag.name)}
                  variant="outline"
                  size="sm"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Card className="border-0 shadow-lg rounded-3xl bg-surface">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-text-muted tracking-wider uppercase mb-6">CATEGORIES</h3>
            
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => onCategoryClick?.(category.id)}
                  className="w-full text-left px-3 py-2 hover:bg-surface-secondary rounded-xl transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-primary group-hover:text-accent transition-colors">
                      {category.name}
                    </span>
                    <Badge variant="secondary" className="text-xs bg-surface-secondary border-0">
                      {category.post_count || 0}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
}