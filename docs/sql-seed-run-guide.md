# SQL Seed Guide for Supabase

This guide shows how to run the seed scripts in Supabase for the restaurant database.

## What to run

If you are setting up data for the current app, run these files in order:

1. `sql/01-core-schema.sql`
2. `sql/03-customer-profile-updates.sql`
3. `sql/04-loyalty-system.sql`
4. `sql/05-seed-nepali-thai.sql`

If your database already has the core schema, you can run only the later files that you need.

## Option 1: Run in Supabase Dashboard

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Click **New query**.
4. Paste the full content of one SQL file.
5. Click **Run**.
6. Repeat for the next file.

## Option 2: Run from a local SQL client

If you use `psql`, connect to your Supabase database and run:

```bash
psql "postgresql://USER:PASSWORD@HOST:5432/DBNAME" -f sql/05-seed-nepali-thai.sql
```

Use the same command for the other SQL files by changing the file name.

## Recommended order

For a fresh setup:

1. Core schema
2. Customer profile updates
3. Loyalty system
4. Seed data

For an existing project:

1. Run only the missing migration file
2. Then run the seed file if you want demo data

## Quick checks after running

1. Confirm `loyalty_settings` has the default row.
2. Confirm `menu_categories` or `categories` has data, depending on which seed file you ran.
3. Confirm `menu_items` has 100+ rows if you used `sql/05-seed-nepali-thai.sql`.

## Notes

- `sql/05-seed-nepali-thai.sql` follows the simple table names you requested.
- The app code currently uses `menu_categories` and `menu_items`, so the app-ready seed path is the migration set in the first section.
- If you want one clean command, the Supabase SQL Editor is the easiest option.
