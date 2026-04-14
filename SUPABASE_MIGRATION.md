# OrderChha Migration to Supabase-Only Architecture

## Changes Made

This guide documents the move to a Supabase-only stack for persistent data across sessions.

1. **Removed Hybrid Context**:
   - The application now uses only the Supabase context provider (`app-context-supabase.tsx`)
   - Removed the hybrid context file (`app-context-hybrid.tsx`)

2. **Updated Root Layout**:
   - Changed the import in `/src/app/layout.tsx` to use the Supabase context provider

3. **Created Dedicated Debug Page**:
   - Created a new database debug page at `/debug/database`
   - Focused on displaying Supabase connection status

4. **Removed legacy auth dependencies**:
   - The application now uses Supabase Auth and Supabase data access only.

5. **Updated root layout and context**:
   - The app provider and auth flow now resolve through the Supabase client.

6. **Kept the Supabase debug path**:
   - Use `/debug/database` and `/api/test-supabase` to verify connectivity.

7. **Updated Documentation**:
   - Updated `TROUBLESHOOTING.md` to focus on Supabase connection issues
   - Updated `README.md` to reflect the new architecture

## Running the Application

1. Ensure your Supabase environment variables are set correctly:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. Start the application:
   ```bash
   npm run dev
   ```

3. Test the database connection:
   - Visit `/debug/database` to check Supabase connection status
   - Visit `/api/test-supabase` to directly test the API connection

## Notes

Keep the SQL setup limited to the two canonical files in `sql/`.
Do not combine older SQL scripts with the canonical pair.
