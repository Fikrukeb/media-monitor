# AgriMonitor - Ethiopian Agriculture Media Monitoring

A production-ready media monitoring web application focused on Ethiopian agriculture. Tracks news, blogs, and social media with real-time sentiment analysis and an analytics dashboard.

## Features

- **Data Ingestion**: RSS feeds (AllAfrica, Ethiopian Reporter, Addis Standard) + mock data
- **Sentiment Analysis**: OpenAI-powered classification (positive, neutral, negative)
- **Dashboard**: Summary cards, sentiment over time, topic distribution, article table
- **Filters**: Date range, sentiment, keyword search

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (gpt-4o-mini)
- Prisma ORM (SQLite dev / PostgreSQL prod)
- Recharts

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Initialize database (requires PostgreSQL - use Neon/Supabase free tier for local)
npm run db:migrate

# Optional: seed default source
npm run db:seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (required; use pooled URL for Vercel) |
| `OPENAI_API_KEY` | Required for sentiment analysis during ingestion |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ingest` | Fetch content, analyze sentiment, store in DB |
| GET | `/api/articles` | List articles (filters: sentiment, from, to, search) |
| POST | `/api/analyze` | Analyze text sentiment (body: `{ "text": "..." }`) |
| GET | `/api/stats` | Dashboard statistics |

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── articles/      # Articles page
│   ├── settings/      # Settings page
│   └── page.tsx       # Dashboard
├── components/
│   ├── dashboard/     # SummaryCards, Charts, Filters
│   ├── articles/      # ArticleTable
│   └── layout/        # Sidebar, DashboardLayout
└── lib/
    ├── ingestion/     # RSS fetcher, keywords
    ├── openai.ts      # Sentiment analysis
    └── prisma.ts      # DB client
```

## Production (Vercel)

SQLite does not work on Vercel (ephemeral filesystem). Use PostgreSQL:

1. **Create a PostgreSQL database** (free options):
   - [Neon](https://neon.tech) – serverless Postgres
   - [Vercel Postgres](https://vercel.com/storage/postgres) – add via Vercel dashboard
   - [Supabase](https://supabase.com) – free tier

2. **Add environment variables** in Vercel:
   - `DATABASE_URL` – PostgreSQL connection string (use pooled URL for serverless)
   - `BETTER_AUTH_SECRET` – `openssl rand -base64 32`
   - `BETTER_AUTH_URL` – your production URL (e.g. `https://yourapp.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` – same as above
   - `OPENAI_API_KEY` – required for sentiment analysis

3. **Deploy** – migrations run automatically during build (`prisma migrate deploy`)

For **local dev** with PostgreSQL, use a Neon/Supabase free database or Docker.

## License

MIT
