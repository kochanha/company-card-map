# 법카맵 💳

> Corporate card restaurant map — find upscale restaurants worth visiting on a company card.

**[https://companycard.vercel.app](https://companycard.vercel.app)**

## Features

- **Map-based exploration** — Browse 1,950+ restaurants on an interactive Leaflet map
- **Filtering** — By price range (30K–50K / 50K–80K / 80K+ KRW), category (Korean, Japanese, Western, Chinese, Fine Dining, Buffet, BBQ, Seafood), and Google rating
- **Geolocation** — Auto-detects user location and sorts by distance
- **Quick links** — Open any restaurant directly in Kakao Map or Naver Map
- **Submission system** — Submit restaurants via Naver Map or Kakao Map link, admin-approved and auto-synced on build

## Supported Regions

Seoul · Incheon · Suwon · Seongnam · Busan (more coming soon)

## Tech Stack

| Area | Technology |
|------|-----------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Map | Leaflet + OpenStreetMap + MarkerCluster |
| Database | Supabase (PostgreSQL) |
| Data Pipeline | Kakao Local API (collection), Google Places API (ratings) |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata + AdSense
│   ├── page.tsx            # Main client page (map + list + filters)
│   ├── error.tsx           # App-level error boundary
│   └── globals.css         # Tailwind base styles
├── components/
│   ├── LeafletMap.tsx      # Interactive map with markers and clustering
│   ├── FilterBar.tsx       # Price, category, and rating filter bar
│   ├── RestaurantCard.tsx  # Restaurant list item card
│   ├── Header.tsx          # Top navigation bar
│   ├─�� SubmitModal.tsx     # Restaurant submission form
│   ├── WelcomeModal.tsx    # First-visit welcome dialog
│   └── AdBanner.tsx        # Google AdSense banner
├── lib/
│   ├── supabase.ts         # Supabase client initialization
│   └── map-url-parser.ts   # Naver/Kakao Map URL parser and validator
├── types/
│   └── restaurant.ts       # Restaurant, Category, PriceRange types
├── config/
│   └── constants.ts        # App-wide constants (AdSense, map defaults, etc.)
└── data/
    └── restaurants.ts      # Generated restaurant data (~1,950 entries)

scripts/
├── fetch-restaurants.ts    # Scrape restaurants via Kakao Local API
├── enrich-with-google.ts   # Enrich with Google Places ratings
├── cleanup-restaurants.ts  # Filter out low-price restaurants
├── sync-submissions.ts     # Sync approved Supabase submissions into data
└── setup-supabase.sql      # Database schema for submissions table
```

## Data Pipeline

```
Kakao API → fetch restaurants → Google API → enrich ratings → static data
                                                                   ↓
User submission → Supabase → admin approval → build-time sync → deploy
```

## Getting Started

### Prerequisites

- Node.js 24+
- npm
- Supabase project (for submissions)

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in API keys (see below)

# Run development server
npm run dev

# Production build and start
npm run build && npm start
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous public key |
| `KAKAO_REST_KEY` | Scripts only | Kakao REST API key (for data collection) |
| `GOOGLE_API_KEY` | Scripts only | Google Places API key (for rating enrichment) |
| `NEXT_PUBLIC_ADSENSE_ID` | No | Google AdSense publisher ID (has default) |

### Scripts

```bash
npm run dev        # Start dev server
npm run build      # Sync submissions + production build
npm run sync       # Sync approved submissions only
npm run lint       # Run ESLint
npm run test       # Run unit tests (Vitest)
npm run test:watch # Run tests in watch mode

# Data pipeline scripts
npx tsx scripts/fetch-restaurants.ts      # Scrape restaurants from Kakao
npx tsx scripts/enrich-with-google.ts     # Add Google ratings
npx tsx scripts/cleanup-restaurants.ts    # Remove low-price entries
```

## License

MIT
