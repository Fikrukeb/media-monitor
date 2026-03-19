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

# Initialize database
npm run db:push

# Optional: seed default source
npm run db:seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite: `file:./dev.db` or PostgreSQL connection string |
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

## Production

1. Switch to PostgreSQL: update `DATABASE_URL` and `provider` in `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Set `OPENAI_API_KEY`
4. Deploy (Vercel, etc.)

## License

MIT
