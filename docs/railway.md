# Railway notes (Phase 0)

Hosting target: **Railway** · Custom domain: not purchased yet

## Suggested services
1. **backend** — Django (`gunicorn config.wsgi`) from `backend/`
2. **frontend** — static build from `frontend/` (`npm run build` → serve `dist/`) or Railway static site

## Backend env vars (set in Railway)
See `backend/.env.example`

Minimum:
- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG=false`
- `DJANGO_ALLOWED_HOSTS=.railway.app`
- `CORS_ALLOWED_ORIGINS=https://<frontend>.up.railway.app`
- `CSRF_TRUSTED_ORIGINS=https://<frontend>.up.railway.app`
- `DEFAULT_CURRENCY=PKR`

Later: switch SQLite → Postgres via `DATABASE_URL`.

## Local vs Railway
Local uses SQLite + `.env`. Production should use Postgres + volume or S3 for media.
