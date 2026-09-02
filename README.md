# Kasturi Girls Hostel — Management System

Admin-only management system for **Kasturi Girls Hostel**. First module: **monthly payments** (with partial-payment support and printable receipts). Built to extend later with attendance, leave, and in/out tracking.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres) — accessed server-side via the service role key
- Cookie session auth (JWT via `jose`), single admin account from env vars

## Features
- Admin login (only admin can access anything)
- Residents: name, age, class, school/institution, phone, room number, monthly fee
- Add / edit / deactivate residents
- Record payments per billing month — **partial payments supported** (multiple payments per month; a month is "Paid" once the total reaches the fee)
- Dashboard with per-month payment status (Paid / Partial / Unpaid) and collection totals
- Printable payment confirmation receipt per payment

## Environment variables
See `.env.example`. Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET` (long random string)

## Local dev
```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

## Database
Two tables: `residents` and `payments` (see Supabase project). RLS is enabled with no public policies — the DB is only reachable through the server using the service role key.

## Deploy
Deployed on Vercel. Set the five env vars in the Vercel project settings.
