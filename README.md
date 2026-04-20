# OrderChha

OrderChha is a restaurant POS and operations app built with Next.js, React, and Supabase.

## Stack

- TypeScript
- Next.js (App Router)
- React 18
- Tailwind CSS
- Supabase (PostgreSQL + Auth)

## Project Structure

- `src/app` application routes
- `src/components` UI and feature components
- `src/context` app state and business flows
- `src/lib/supabase.ts` database/auth helper layer
- `sql` schema and seed scripts

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Copy env template and fill values.

```bash
cp .env.local.example .env.local
```

3. Run SQL scripts in order.

- `sql/01-core-schema.sql`
- `sql/03-customer-profile-updates.sql`
- `sql/04-loyalty-system.sql`
- `sql/05-seed-nepali-thai.sql`

Detailed SQL run guide: `docs/sql-seed-run-guide.md`.

4. Start dev server.

```bash
npm run dev
```

Default local URL: `http://localhost:9002`.

## Build

```bash
npm run build
npm run start
```

## Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional:

- `NEXT_PUBLIC_DEBUG_SUPABASE`
- `NEXT_PUBLIC_IMGBB_API_KEY`

## Deployment

Deploy to Vercel and configure environment variables in Vercel project settings.

## Notes

- Historical summaries and fix reports have been moved to `docs/archive/reports` to keep the root clean.
