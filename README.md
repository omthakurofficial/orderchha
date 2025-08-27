# orderchha

Orderchha is a point-of-sale / restaurant management web application built with modern React and Next.js technologies.

## At a glance

- Language: TypeScript
- Framework: Next.js (app router)
- UI: React 18 + Tailwind CSS
- Hosting / Backend integrations: Firebase (Auth + Firestore) for realtime data and authentication
- Other notable libraries: GenKit (AI helpers), Radix UI, react-hook-form, date-fns

The project was scaffolded as a Next.js app and contains both frontend pages and Firebase client wiring under `src/lib/firebase.ts`.

## What you'll find in this repo

- `src/app` — Next.js app routes and pages (app router)
- `src/components` — UI components grouped by feature
- `src/lib/firebase.ts` — Firebase initialization (reads `NEXT_PUBLIC_FIREBASE_CONFIG`)
- `package.json` — scripts and dependency list
- `next.config.ts` — Next configuration (images, typescript/eslint settings)

## Quick local setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file `.env.local` at the project root and add your Firebase config as a single JSON string assigned to `NEXT_PUBLIC_FIREBASE_CONFIG` (example below).

Example `.env.local`:

```bash
# Copy the JSON object you get from Firebase console and stringify it into this variable.
NEXT_PUBLIC_FIREBASE_CONFIG='{"apiKey":"YOUR_API_KEY","authDomain":"YOUR_PROJECT.firebaseapp.com","projectId":"YOUR_PROJECT","storageBucket":"YOUR_PROJECT.appspot.com","messagingSenderId":"...","appId":"...","measurementId":"..."}'
```

3. Start dev server (the project uses port 9002 in package.json dev script):

```bash
npm run dev
# or with pnpm/yarn if you use them
```

Open http://localhost:9002 in your browser.

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

- `NEXT_PUBLIC_FIREBASE_CONFIG` (required) — stringified Firebase config JSON used by `src/lib/firebase.ts`.

You may add other environment variables as needed by your own Firebase project or third-party integrations.

## Deploying

Recommended: deploy to Vercel (first-class Next.js support)

Vercel (recommended)

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Vercel, import the repository and follow the prompts.
3. In the Vercel project settings, set environment variables (Production and Preview):
   - `NEXT_PUBLIC_FIREBASE_CONFIG` — same stringified JSON as your `.env.local`
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
```Firebase Hosting (alternative)

You can host a static export of this app with Firebase Hosting. WARNING: a static export with `next export` will not support server-side rendering or API routes from Next's app router. Only use this if your app does not rely on SSR or dynamic server functions.

Static export steps (limited feature set):

```bash
# 1. Build and export
npm run build
npx next export -o out

# 2. Initialize Firebase hosting (if you haven't already)
npx firebase init hosting

# 3. Set the public directory to `out` in firebase.json and deploy
npx firebase deploy --only hosting
```

Or use the included deployment script:

```bash
./deploy.sh firebase
```

If you need full Next.js runtime on Firebase, you'll need a more advanced setup (Cloud Run or Functions with a custom server). For production-grade Next.js with SSR, prefer Vercel.

## How to get your Firebase config

1. Go to the Firebase Console -> Project Settings -> Your apps -> Firebase SDK snippet -> Config.
2. Copy the config object and paste it into `NEXT_PUBLIC_FIREBASE_CONFIG` as a single-line JSON string (see `.env.local` example above).

## Notes and caveats

- `src/lib/firebase.ts` expects `NEXT_PUBLIC_FIREBASE_CONFIG` to be present at runtime — the app throws if it is missing.
- `next.config.ts` currently sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`. That means the build will succeed even with type or lint errors — consider changing for CI.
- The project uses Next 15 and React 18.

## Troubleshooting

- If Firebase complains about invalid config, verify the JSON string in `.env.local` is valid and properly quoted.
- If you get routing or 404 problems on static export, it likely means your app requires SSR or dynamic routes. Use Vercel for full Next support.

## Where to start reading the code

- `src/app/page.tsx` — top-level entry for the app
- `src/lib/firebase.ts` — Firebase initialization and usage
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

3. **Deploy to Firebase** - Can deploy to Firebase Hosting on push to `master`
   - Requires `FIREBASE_SERVICE_ACCOUNT` and `FIREBASE_PROJECT_ID` secrets in GitHub repository settings

To use these workflows, you need to:
1. Set up the required secrets in your GitHub repository settings
2. Uncomment the workflow files in `.github/workflows/` as needed

---

If you'd like, I can also:

- add a sample `.env.local.example` with a template
- add a `vercel.json` with recommended settings
- prepare a Firebase `firebase.json` for static hosting

Tell me which of those you'd like me to add next.
