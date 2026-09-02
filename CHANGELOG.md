# Changelog

All notable changes to the Kasturi Girls Hostel Management System are documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-09-03

### Changed
- Deleting a resident is now a **soft delete**. Instead of removing the row, the
  resident is marked with `deleted_at` and set inactive, so all payment history
  is preserved and the record can be restored later.
- Soft-deleted residents are hidden from the dashboard list, and their detail
  page returns 404.
- Delete confirmation copy updated to state that history is kept and the action
  is reversible.

### Database
- Added `deleted_at timestamptz` column and index to `public.residents`
  (migration `add_residents_deleted_at`).

## [0.2.0] - 2026-09-03

### Added
- **Delete a resident** — delete button on the resident detail page with a
  confirmation prompt.
- **Full partial-payment receipts** — a printed receipt now lists every payment
  made for that billing month up to and including the printed one, each with its
  own payment time, method, and amount, plus a running total. Status shows
  "Partial payment" until the fee is met, then "Paid ✓".

### Changed
- Simplified the receipt header to show only **name, room, and month**.
- Reworked the site theme to the Kasturi brand colours: **green** (`#3f7d24`)
  with a **golden-yellow** accent (`#f4c421`), applied across the dashboard
  header, login screen, buttons, and receipts.

## [0.1.0] - Initial

### Added
- Admin login (single admin account).
- Residents: add, edit, deactivate; name, age, class, school, phone, room, fee.
- Monthly payments with partial-payment support.
- Dashboard with per-month payment status and collection totals.
- Printable per-payment receipt.

[0.3.0]: https://github.com/ASMCorp/kasturi-hostel/releases/tag/v0.3.0
[0.2.0]: https://github.com/ASMCorp/kasturi-hostel/releases/tag/v0.2.0
[0.1.0]: https://github.com/ASMCorp/kasturi-hostel/releases/tag/v0.1.0
