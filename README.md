# Liga Padel Demo

Mobile-first Vue 3 app for organizing weekly padel matches with public join requests and admin approvals through Supabase.

## Stack

- Vue 3 + Composition API
- Vite
- Tailwind CSS
- Supabase database + auth
- Vercel-friendly SPA routing

## Local setup

1. Copy `.env.example` to `.env`.
2. Add your Supabase project URL and publishable key.
3. In Supabase SQL editor, run [`supabase/schema.sql`](./supabase/schema.sql).
4. Optional: run [`supabase/seed.sql`](./supabase/seed.sql) to load demo matches and registrations.
5. Create an admin user in Supabase Authentication with email/password.
6. Install dependencies with `npm install`.
7. Start the app with `npm run dev`.

## Supabase notes

- Public users can read matches and approved registrations only.
- Public users can insert registrations only when `status = 'pending'`.
- Admin users authenticate with Supabase Auth and can manage matches plus approve/refuse/add players.
- Approval and direct-add flows use SQL functions so the "max 4 approved players" rule is enforced in the database.

## Deploy to Vercel

1. Import the project into Vercel.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` as environment variables.
3. Build command: `npm run build`
4. Output directory: `dist`

`vercel.json` already rewrites all routes to `/` for SPA routing.
