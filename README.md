# AM Enterprises

Household products e-commerce — **Your trust, our commitment**

Monorepo: `backend/` (Django + DRF) · `frontend/` (React + Vite + Tailwind)  
Hosting target: **Railway** · Domain: not purchased yet

## Quick start

### Backend
```bash
cd backend
.\.venv\Scripts\Activate.ps1   # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_catalog
python manage.py runserver
```

- Health: http://127.0.0.1:8000/api/health/
- Swagger: http://127.0.0.1:8000/api/docs/
- Django admin: http://127.0.0.1:8000/admin/ (`admin` / `admin123` after seed)

### Frontend
```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173  
- Vite proxies `/api` and `/media` to Django

## Structure
```
AM enterprises/
├── backend/          # Django API
├── frontend/         # React storefront + admin shell
├── docs/             # OpenAPI sketch, notes
├── design.md         # Visual system
├── development.md    # Phased plan
└── logo.jpg          # Brand logo
```

## Railway deploy (2 services)

### Backend service
- **Root directory:** `backend`
- **Build command:**
  ```bash
  pip install -r requirements.txt && python manage.py collectstatic --noinput
  ```
- **Start / release command:**
  ```bash
  python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
  ```
  (Keep migrate on **start**, not build — build often has no DB yet.)
- After first deploy (once): Railway shell → `python manage.py seed_catalog`

### Frontend service
- **Root directory:** `frontend`
- **Build command:**
  ```bash
  npm ci && npm run build
  ```
- **Start command:**
  ```bash
  npm run start
  ```
- Set `VITE_API_URL` **before build** (Vite bakes it in at build time):
  `https://YOUR-BACKEND.up.railway.app` (no trailing slash)

### Required variables
See `backend/.env.example` for backend. Frontend needs only `VITE_API_URL`.  
After both URLs exist, set backend `CORS_ALLOWED_ORIGINS` + `CSRF_TRUSTED_ORIGINS` to the frontend HTTPS URL.

Add a **Postgres** plugin to the backend service (recommended). Railway sets `DATABASE_URL` automatically.
