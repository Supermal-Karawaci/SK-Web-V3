# SK Web V3

Public website for Supermal Karawaci shopping center built with React, TypeScript, and Vite.

## Features

- Tenant directory with category filtering and search
- Events and promotions pages
- Blog with categories
- VIP membership program information
- Cinema showtimes (XXI)
- Contact form with enquiry types
- Light/dark theme support

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173)

### Build

```bash
npm run build
```

Output in `dist/` directory.

### Other Commands

```bash
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** with CSS custom properties for theming
- **React Router 7** for client-side routing
- **Supabase** for backend database
- **Framer Motion** for animations

## Project Structure

```
src/
├── components/       # Page components and sections
│   ├── ui/          # Reusable UI primitives
│   └── hero/        # Hero section variants
├── lib/
│   ├── hooks/       # Custom React hooks
│   ├── seo/         # SEO configuration
│   └── supabase.ts  # Database client and types
└── App.tsx          # Routes and layout
```

## Deployment

Configured for Netlify:

- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirects: `public/_redirects`
