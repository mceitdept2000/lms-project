# MCE LMS

A repository for Anna University question papers (end-semester, IAT, and assignment) and subject notes. Files are uploaded and tagged by admins, and can be browsed and downloaded by anyone without an account.

See [DESIGN.md](./DESIGN.md) for the full technical specification.

## Stack

- [Next.js](https://nextjs.org) (App Router) + [Tailwind CSS](https://tailwindcss.com) v4
- [tRPC](https://trpc.io) for the API layer
- [Prisma](https://prisma.io) + PostgreSQL
- [Better Auth](https://better-auth.com) (username/password) for authentication and permissions
- [Supabase Storage](https://supabase.com/storage) for uploaded files

## Features

- **Notes & question papers**: paginated, searchable, filterable browsing — no login required to download.
- **Uploads**: PDF/Word files, gated behind the `UPLOAD_FILES` permission.
- **Catalog management**: subjects and exams, with normalized naming (e.g. exam codes like `AM2024-IAT1` auto-expand to a display name), gated behind `MANAGE_CATALOG`.
- **User management**: create users and assign permissions, gated behind `MANAGE_USERS`.
- **Admin dashboard**: at-a-glance stats and quick links, scoped to whatever the logged-in user has permission to do.

Permissions are plain strings on the `User` row (`UPLOAD_FILES`, `MANAGE_CATALOG`, `MANAGE_USERS`) — see `src/lib/constants.ts`.

## Getting started

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` (see [`start-database.sh`](./start-database.sh) for a local Postgres via Docker), a `BETTER_AUTH_SECRET`, and your Supabase project's `SUPABASE_URL` / `SUPABASE_SECRET_KEY` (the `service_role` key — storage writes bypass RLS through this key server-side). Create a Storage bucket matching `SUPABASE_STORAGE_BUCKET` (default `files`) in the Supabase dashboard.

3. Push the schema to your database:

   ```bash
   yarn db:push
   ```

4. Seed an initial admin account (set `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` in `.env` first):

   ```bash
   yarn db:seed
   ```

5. Start the dev server:

   ```bash
   yarn dev
   ```

## Scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `yarn dev`          | Start the dev server (Turbopack)             |
| `yarn build`        | Production build                             |
| `yarn check`        | Lint + typecheck                             |
| `yarn db:push`      | Push the Prisma schema to the database (dev) |
| `yarn db:seed`      | Create the seed admin user (idempotent)      |
| `yarn db:studio`    | Open Prisma Studio                           |
| `yarn db:generate`  | Create a migration (`prisma migrate dev`)    |
| `yarn db:migrate`   | Apply migrations (`prisma migrate deploy`)   |
| `yarn format:write` | Format the codebase with Prettier            |

## File storage

Uploaded files go to Supabase Storage via a small storage driver abstraction (`src/server/storage/`) — `StorageDriver` in `types.ts` is the seam, and `supabase.ts` is the current implementation. Swapping providers later means adding a new file there, not touching callers.

## Project structure

- `src/app` — pages and API routes (App Router)
- `src/server/api/routers` — tRPC routers (`subject`, `exam`, `note`, `questionPaper`, `user`, `dashboard`)
- `src/server/better-auth` — auth config, session helpers, admin user provisioning
- `src/server/storage` — Supabase Storage driver
- `src/lib/constants.ts` — permissions, mime types, exam code patterns, and other shared constants
- `src/lib/normalization.ts` — title-casing and exam code → name expansion
- `prisma/schema.prisma` — database schema
- `prisma/seed.ts` — seeds the initial admin user
