# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SK Web V3 is a React-based public website for Supermal Karawaci shopping center. It includes a tenant directory, events, promotions, VIP programs, blog, cinema showtimes, and visitor services.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

**Note:** There is no `typecheck` script. Run TypeScript checks manually with `npx tsc --noEmit`.

## Architecture

### Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS with CSS custom properties for theming
- React Router 7 for routing
- Supabase for backend (database + real-time)
- Framer Motion for animations

### Path Aliases
Use `@/` for imports from `src/` (configured in both vite.config.ts and tsconfig.app.json).

### Data Layer

**Supabase Client** ([src/lib/supabase.ts](src/lib/supabase.ts))
- Contains all TypeScript interfaces (Tenant, Event, Contact, VipTier, Post, Promotion, etc.)
- Implements fetch functions with pagination, filtering, and search
- Uses database views as primary data source with fallback to direct table queries
- Key views: `tenant_directory`, `v_promotions_full`, `v_whats_on_frontend`

**Custom Hooks** (`src/lib/hooks/`)
- Data fetching hooks follow a consistent pattern with loading/error states
- `useTenants`, `useFeaturedRestaurants`, `useNewTenants`, `useFeaturedEvents`, `useWhatsOn`

### Theme System

**Theme Config** ([src/lib/theme-config.ts](src/lib/theme-config.ts))
- Supports light/dark themes with default set to dark
- Uses CSS custom properties (e.g., `--color-surface`, `--color-accent`)
- `useTheme()` hook provides `currentTheme`, `toggleTheme`, `switchTheme`
- Theme persisted in localStorage

**Tailwind Integration** ([tailwind.config.js](tailwind.config.js))
- Colors reference CSS variables: `'surface': 'var(--color-surface)'`
- Always use semantic color names, never hardcode hex values

### Routing

Routes defined in [src/App.tsx](src/App.tsx):
- `/` - Homepage
- `/directory` - Tenant directory
- `/promotions` - Promotions
- `/event` - Events list, `/event/:slug` - Event detail
- `/blog` - Blog, `/blog/:slug` - Post detail
- `/movies` - Cinema showtimes
- `/vip-cards` - VIP program
- `/contact` - Contact form

### Component Organization

- `src/components/` - Page-level components (MallDirectory, EventsPage, etc.)
- `src/components/ui/` - Reusable UI primitives (cards, forms, modals)
- `src/components/hero/` - Hero section variants

## Environment Variables

Create `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Key Patterns

### Database Queries
Queries use a view-first approach with fallback:
```typescript
// Primary: optimized view
const { data } = await supabase.from('tenant_directory').select('*');
// Fallback: manual joins if view unavailable
```

### Adding New Routes
1. Create component in `src/components/`
2. Add route in `src/App.tsx` wrapped with `<Layout>`
3. Update navigation in `src/components/Navbar.tsx` if needed

### Adding Database Entities
1. Add TypeScript interface in `src/lib/supabase.ts`
2. Create fetch function with fallback strategy
3. Create custom hook in `src/lib/hooks/`

## Deployment

Netlify deployment:
- Build: `npm run build`
- Publish: `dist`
- Redirects: `public/_redirects`
