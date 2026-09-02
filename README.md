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
- **Delete a resident (soft delete)** — hidden from lists, payment history preserved, reversible via `deleted_at`
- Record payments per billing month — **partial payments supported** (multiple payments per month; a month is "Paid" once the total reaches the fee)
- Dashboard with per-month payment status (Paid / Partial / Unpaid) and collection totals
- **Printable receipts** — recording a payment shows a "Payment successful" confirmation; a single "Print receipt" button per billing month opens a receipt that lists every payment for that month (each with its own payment time), shows the running total and Partial/Paid status, and prints only the resident's name, room, and month in the header

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
Two tables: `residents` and `payments` (see Supabase project). Residents use a
`deleted_at` timestamp for soft deletion (a row is "deleted" when `deleted_at` is
set; clear it to restore). RLS is enabled with no public policies — the DB is only
reachable through the server using the service role key.

## Deploy
Deployed on Vercel. Set the five env vars in the Vercel project settings.
