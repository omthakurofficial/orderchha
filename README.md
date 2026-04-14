# orderchha

Orderchha is a point-of-sale / restaurant management web application built with modern React and Next.js technologies.

## At a glance

- Language: TypeScript
- Framework: Next.js (app router)
- UI: React 18 + Tailwind CSS
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Other notable libraries: GenKit (AI helpers), Radix UI, react-hook-form, date-fns

The project was scaffolded as a Next.js app and contains both frontend pages and Supabase client wiring under `src/lib/supabase.ts`.

## What you'll find in this repo

- `src/app` — Next.js app routes and pages (app router)
- `src/components` — UI components grouped by feature
- `src/lib/supabase.ts` — Supabase initialization and database helpers
- `src/lib/supabase.ts` — Supabase database and authentication helpers
- `package.json` — scripts and dependency list
- `next.config.ts` — Next configuration (images, typescript/eslint settings)

## Quick local setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file `.env.local` at the project root and add your Supabase credentials:

Example `.env.local`:

```bash
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase auth uses the same project credentials as data access
```

3. Set up the database by running these scripts in order:
   - `sql/01-core-schema.sql`
   - `sql/02-seed-demo-data.sql`

4. Start dev server:

```bash
npm run dev
# or with pnpm/yarn if you use them
```

Open http://localhost:3000 in your browser.

There are also GenKit helper scripts if you use the AI flows in `src/ai`:

```bash
npm run genkit:dev
npm run genkit:watch
```

## Build and production

Build for production:

```bash
npm run build
npm run start
```

Note: `next start` will run the built Next.js server.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for both data access and authentication.

## Deploying

Recommended: deploy to Vercel (first-class Next.js support)

Vercel (recommended)

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Vercel, import the repository and follow the prompts.
3. In the Vercel project settings, set environment variables (Production and Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Build & Output settings (Vercel usually detects Next.js automatically):
   - Build command: `npm run build`
   - Output directory: leave default (Vercel will handle Next)

Vercel will handle SSR/Edge functions and the Next app router properly.

**Using Vercel CLI (alternative)**

For CLI deployment:

```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

Or use the included deployment script:

```bash
./deploy.sh vercel
```

For this repo, Vercel is the recommended deployment target.

## Notes and caveats

- `next.config.ts` currently sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`. That means the build will succeed even with type or lint errors — consider changing for CI.
- The project uses Next 15 and React 18.

## Troubleshooting

- If you get routing or 404 problems on static export, it likely means your app requires SSR or dynamic routes. Use Vercel for full Next support.

## Where to start reading the code

- `src/app/page.tsx` — top-level entry for the app
- `src/lib/supabase.ts` — Supabase database and authentication helpers
- `src/components` — reusable components grouped by feature

## Contribution

Feel free to open pull requests. If you plan to change runtime behavior (SSR, API routes), update the README and deployment instructions accordingly.

## CI/CD

This project includes GitHub Actions workflows for continuous integration and deployment:

1. **Build and Test** - Runs on every push and pull request to `master`
   - Installs dependencies
   - Runs typechecking
   - Builds the Next.js application
   - Runs linting

2. **Deploy to Vercel** - Automatically deploys to Vercel on push to `master`
   - Requires `VERCEL_TOKEN` secret to be set in GitHub repository settings

3. **Deploy to Vercel** - Deploys the Next.js app on push to `master`
   - Requires `VERCEL_TOKEN` secret in GitHub repository settings

To use these workflows, you need to:
1. Set up the required secrets in your GitHub repository settings
2. Uncomment the workflow files in `.github/workflows/` as needed

---

If you'd like, I can also:

- add a sample `.env.local.example` with a template
- add a `vercel.json` with recommended settings

Tell me which of those you'd like me to add next.
