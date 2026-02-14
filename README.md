# Library Management System (Django + Supabase Postgres)

A mini/full-length academic project featuring authentication, role-based access (Admin/Student), book catalog, issue/return workflow with fines, and dashboard metrics. Uses Django templates with a light-orange Bootstrap theme.

## Features
- Student registration/login, Admin login (Django auth with hashed passwords, sessions)
- Role-based dashboards (Admin: stats + requests; Student: latest books + my issues)
- CRUD: Books, Authors, Categories
- Book search/filter, availability tracking
- Issue/return flow with statuses (Requested, Issued, Returned, Rejected)
- Overdue detection and automatic fine calculation (per-day rate configurable)
- Supabase/PostgreSQL ready via environment variables

## Project Structure
Matches the required layout: apps `accounts`, `books`, `transactions`; templates/static; `.env.example`, `requirements.txt`, `manage.py`.

## Setup (Local)
1) **Python env**: Python 3.10+ recommended. Create venv: `python -m venv .venv && .venv\Scripts\activate` (Windows).
2) **Install deps**: `pip install -r requirements.txt`.
3) **Env vars**: Copy `.env.example` to `.env` and fill Supabase Postgres credentials plus a strong `DJANGO_SECRET_KEY`.
4) **Migrate**: `python manage.py migrate`.
5) **Superuser**: `python manage.py createsuperuser` (for Admin role, set profile role to ADMIN via admin site or shell).
6) **Run**: `python manage.py runserver` then visit `http://127.0.0.1:8000/`.

## Deploy on Vercel (Docker)
1) Ensure `DJANGO_DEBUG=False` and add your Vercel hostname to `DJANGO_ALLOWED_HOSTS` in `.env` or project env vars.
2) Vercel picks up `vercel.json` + `Dockerfile`; it builds the image and runs `gunicorn`.
3) Set env vars in Vercel: `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `SUPABASE_DB_*`, `SUPABASE_SSL_MODE=require`, `DJANGO_SESSION_AGE`, etc.
4) After first deploy, run `python manage.py migrate` (via Vercel CLI/shell). Optionally seed data: `python manage.py shell < scripts/seed_books.py`.
5) Static files are served by WhiteNoise; collectstatic runs during the Docker build.

## Database Notes (Supabase Postgres)
- The app uses Django ORM; configure connection via `SUPABASE_DB_*` variables.
- Tables: Users (Django auth), UserProfile, Author, Category, Book, BookIssue, Fine. Foreign keys enforce relationships and normalization.

## Sample Data
- After migrating, use Django admin to add Authors, Categories, and Books. You can also create students via Register page. Admin can approve/reject requests.

## Flow Diagram (text)
User -> Login/Register -> Dashboard (role-based) -> Books list -> Student requests issue -> Admin approves (issue_date + due_date set) -> Student sees issued; overdue triggers fine on return.

## Testing Checklist
- Register a student and log in.
- Create admin (via superuser) and set profile role to ADMIN.
- Add Authors, Categories, Books; verify availability counts.
- Student: request a book; Admin: approve; verify due date and availability decrement.
- Mark return; confirm availability increments and fine created if overdue.

## Screenshots
Add your own screenshots in `static/images` and reference them here for submissions.
