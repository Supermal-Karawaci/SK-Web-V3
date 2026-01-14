// src/components/BlogPage.tsx
// Modified: Two-column layout, numerical pagination, proper hero integration, contrast fixes

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, X, Laptop, Plane, Trophy, Briefcase, TrendingUp, Flame, BarChart3, Folder } from 'lucide-react';
import { fetchPosts, fetchFeaturedPosts, fetchBlogCategories, type Post, type PostFetchParams, type BlogCategory } from '../lib/supabase';
import { seededPosts, seededCategories } from '../data/seeded-posts';

// Extended interface for categories with computed post count
interface BlogCategoryWithCount extends BlogCategory {
  post_count: number;
}
import HeroBlog from './ui/HeroBlog';
import BlogSidebar from './ui/BlogSidebar';
import BlogListHorizontal from './ui/BlogListHorizontal';
import BlogCategoryPill from './ui/BlogCategoryPill';
import { useSEO } from '@/lib/hooks/useSEO';
import { PAGE_SEO } from '@/lib/seo/page-seo';

// Category icons mapping
const categoryIcons = {
  'Technology': Laptop,
  'Travel': Plane,
  'Sport': Trophy,
  'Business': Briefcase,
  'Management': TrendingUp,
  'Trends': Flame,
  'Startups': BarChart3,
  'News': Folder,
};

// Fallback data in case imports fail
const fallbackPosts: Post[] = [];
const fallbackCategories: { id: string; name: string; slug?: string }[] = [];

// Safe data access with fallbacks
const safePosts = seededPosts || fallbackPosts;
const safeCategories = seededCategories || fallbackCategories;

interface BlogPageState {
  posts: Post[];
  featuredPosts: Post[];
  categories: BlogCategoryWithCount[];
  isLoading: boolean;
  isFeaturedLoading: boolean;
  isCategoriesLoading: boolean;
  error: string | null;
  usingFallback: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
  searchQuery: string;
  selectedCategory: string;
  selectedTags: string[];
}

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // SEO
  useSEO(
    PAGE_SEO.blog,
    [
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/blog' },
    ]
  );

  // Parse initial tags from URL query parameters
  const initialTags = useMemo(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      // Support both single tag and comma-separated tags
      return tagParam.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
  }, []); // Only compute once on mount

  const [state, setState] = useState<BlogPageState>(() => ({
    posts: [],
    featuredPosts: [],
    categories: [],
    isLoading: true,
    isFeaturedLoading: true,
    isCategoriesLoading: true,
    error: null,
    usingFallback: false,
    currentPage: 1,
    totalPages: 1,
    total: 0,
    searchQuery: '',
    selectedCategory: '',
    selectedTags: initialTags
  }));

  // Fetch posts with pagination
  const fetchPostsData = useCallback(async (params: PostFetchParams = {}) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await fetchPosts({
        page: state.currentPage,
        perPage: POSTS_PER_PAGE,
        search: state.searchQuery || undefined,
        categoryId: state.selectedCategory || undefined,
        tags: state.selectedTags.length > 0 ? state.selectedTags : undefined,
        ...params
      });

      setState(prev => ({
        ...prev,
        posts: result.posts,
        total: result.total,
        totalPages: Math.ceil(result.total / POSTS_PER_PAGE),
        isLoading: false,
        usingFallback: false
      }));
    } catch (error) {
      console.warn('Failed to fetch posts, using fallback data:', error);
      
      // Filter seeded posts based on current filters
      let filteredPosts = [...safePosts];
      
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
          post.title.toLowerCase().includes(query) ||
          post.summary?.toLowerCase().includes(query)
        );
      }
      
      if (state.selectedCategory) {
        filteredPosts = filteredPosts.filter(post => 
          post.category?.id === state.selectedCategory
        );
      }
      
      const total = filteredPosts.length;
      const startIndex = (state.currentPage - 1) * POSTS_PER_PAGE;
      const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
      
      setState(prev => ({
        ...prev,
        posts: paginatedPosts,
        total: total,
        totalPages: Math.ceil(total / POSTS_PER_PAGE),
        isLoading: false,
        usingFallback: true,
        error: 'Using offline data. Some features may be limited.'
      }));
    }
  }, [state.currentPage, state.searchQuery, state.selectedCategory, state.selectedTags]);

  // Fetch featured posts
  const fetchFeaturedData = useCallback(async () => {
    setState(prev => ({ ...prev, isFeaturedLoading: true }));

    try {
      const featured = await fetchFeaturedPosts(3);
      setState(prev => ({
        ...prev,
        featuredPosts: featured,
        isFeaturedLoading: false
      }));
    } catch (error) {
      console.warn('Failed to fetch featured posts, using fallback:', error);
      const featuredFallback = safePosts.filter(post => post.is_featured).slice(0, 3);
      setState(prev => ({
        ...prev,
        featuredPosts: featuredFallback,
        isFeaturedLoading: false
      }));
    }
  }, []);

  // Fetch blog categories from database
  const fetchCategoriesData = useCallback(async () => {
    setState(prev => ({ ...prev, isCategoriesLoading: true }));

    try {
      const categories = await fetchBlogCategories();
      setState(prev => ({
        ...prev,
        categories,
        isCategoriesLoading: false
      }));
    } catch (error) {
      console.warn('Failed to fetch categories, using fallback:', error);
      // Use seeded categories as fallback with 0 counts
      const fallbackCategories = safeCategories.map(cat => ({ ...cat, post_count: 0 }));
      setState(prev => ({
        ...prev,
        categories: fallbackCategories,
        isCategoriesLoading: false
      }));
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchPostsData();
    fetchFeaturedData();
    fetchCategoriesData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (state.currentPage !== 1) {
      setState(prev => ({ ...prev, currentPage: 1 }));
    } else {
      fetchPostsData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.searchQuery, state.selectedCategory, state.selectedTags]);

  // Handle category filter change
  const handleCategoryChange = useCallback((categoryId: string) => {
    setState(prev => ({
      ...prev,
      selectedCategory: categoryId,
      currentPage: 1
    }));
  }, []);

  // Handle search - removed unused function

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
    // Scroll to top of blog content
    document.getElementById('blog-content')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handle hero post selection
  const handleHeroPostSelect = useCallback((slug: string) => {
    navigate(`/blog/${slug}`);
  }, [navigate]);

  // Generate popular tags from posts
  const popularTags = useMemo(() => {
    const tagCount = new Map<string, number>();
    state.posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [state.posts]);

  // Render pagination - Mobile-first responsive
  const renderPagination = () => {
    if (state.totalPages <= 1) return null;

    const pages = [];
    // Show fewer pages on mobile
    const maxVisiblePages = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(state.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`
            min-w-[36px] h-9 sm:min-w-[40px] sm:h-10
            px-2 sm:px-3 py-1.5 sm:py-2
            rounded-lg text-xs sm:text-sm font-medium
            transition-colors
            ${i === state.currentPage
              ? 'bg-accent text-text-inverse'
              : 'text-text-primary hover:bg-surface-secondary border border-border-primary'
            }
          `}
          aria-label={`Go to page ${i}`}
          aria-current={i === state.currentPage ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-8 sm:mt-10 md:mt-12">
        <button
          onClick={() => handlePageChange(state.currentPage - 1)}
          disabled={state.currentPage <= 1}
          className="
            h-9 sm:h-10 px-2.5 sm:px-4 py-1.5 sm:py-2
            rounded-lg text-xs sm:text-sm font-medium
            text-text-primary hover:bg-surface-secondary
            border border-border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
          aria-label="Previous page"
        >
          <span className="hidden xs:inline">Previous</span>
          <span className="xs:hidden">Prev</span>
        </button>

        {pages}

        <button
          onClick={() => handlePageChange(state.currentPage + 1)}
          disabled={state.currentPage >= state.totalPages}
          className="
            h-9 sm:h-10 px-2.5 sm:px-4 py-1.5 sm:py-2
            rounded-lg text-xs sm:text-sm font-medium
            text-text-primary hover:bg-surface-secondary
            border border-border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* Error Banner - Mobile-first responsive */}
      {state.error && !dismissedBanner && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -50 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          className="bg-warning/10 border-b border-warning/20 px-3 sm:px-6 py-2 sm:py-3"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle size={14} className="text-warning flex-shrink-0 sm:w-4 sm:h-4" />
              <p className="text-xs sm:text-sm text-text-primary truncate">{state.error}</p>
            </div>
            <button
              onClick={() => setDismissedBanner(true)}
              className="text-warning hover:text-warning transition-colors flex-shrink-0 p-1"
              aria-label="Dismiss notification"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Hero Section - Mobile-first responsive padding */}
      {!state.isFeaturedLoading && state.featuredPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 mb-6 sm:mb-8 md:mb-12">
          <HeroBlog
            featuredPosts={state.featuredPosts}
            onSelect={handleHeroPostSelect}
          />
        </div>
      )}

      {/* Main Content - Mobile-first responsive padding */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        {/* Category Pills Section - Mobile-first with horizontal scroll on small screens */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12" id="blog-content">
          <h1 className="text-xs sm:text-sm font-medium text-text-muted tracking-wider uppercase mb-4 sm:mb-6 md:mb-8">
            EXPLORE TRENDING TOPICS
          </h1>

          {/* Category Pills - Always centered and wrapped on all screen sizes */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
            {state.categories.map((category) => {
              const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons];
              return (
                <BlogCategoryPill
                  key={category.id}
                  name={category.name}
                  selected={state.selectedCategory === category.id}
                  onClick={() => handleCategoryChange(state.selectedCategory === category.id ? '' : category.id)}
                  variant="secondary"
                  className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium whitespace-nowrap"
                  icon={IconComponent && <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                />
              );
            })}
          </div>
        </div>

        {/* Two Column Layout - Mobile-first responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Left Column - Blog Posts (full width on mobile, 2/3 on desktop) */}
          <div className="lg:col-span-2 min-w-0">
            {state.isLoading ? (
              // Mobile-first loading skeleton
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    {/* Mobile: Stacked layout, Desktop: Side by side */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 pb-4 sm:pb-6 md:pb-8">
                      <div className="w-full sm:w-[45%] h-40 xs:h-48 sm:h-52 md:h-60 bg-surface-secondary rounded-xl sm:rounded-2xl flex-shrink-0" />
                      <div className="w-full sm:w-[55%] space-y-2 sm:space-y-3 md:space-y-4">
                        <div className="h-3 sm:h-4 bg-surface-secondary rounded w-1/3" />
                        <div className="h-5 sm:h-6 md:h-8 bg-surface-secondary rounded w-full" />
                        <div className="h-3 sm:h-4 bg-surface-secondary rounded w-2/3" />
                        <div className="h-8 sm:h-10 bg-surface-secondary rounded w-24 sm:w-32" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <BlogListHorizontal posts={state.posts} />
                {renderPagination()}
              </>
            )}
          </div>

          {/* Right Column - Sidebar (hidden on mobile by default, shown on lg+) */}
          <div className="lg:col-span-1 mt-6 lg:mt-0">
            <BlogSidebar
              featuredPosts={state.featuredPosts.slice(0, 3)}
              categories={state.categories}
              popularTags={popularTags}
              selectedTags={state.selectedTags}
              onTagClick={(tag) => {
                setState(prev => {
                  const newTags = prev.selectedTags.includes(tag)
                    ? prev.selectedTags.filter(t => t !== tag)
                    : [...prev.selectedTags, tag];

                  // Sync URL with selected tags
                  if (newTags.length > 0) {
                    setSearchParams({ tag: newTags.join(',') });
                  } else {
                    setSearchParams({});
                  }

                  return {
                    ...prev,
                    selectedTags: newTags,
                    currentPage: 1
                  };
                });
              }}
              onCategoryClick={handleCategoryChange}
              showAuthor={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}