# AM Enterprises API — OpenAPI sketch (Phase 0)

Live interactive schema after Phase 1: `GET /api/schema/` · Swagger UI: `/api/docs/`

Base URL (local): `http://127.0.0.1:8000`  
Base URL (Railway): `https://<backend>.up.railway.app`

## Auth

| Mode | Use |
|------|-----|
| Public GET | Catalogue, site settings, health |
| Session / Basic (staff) | Mutations (CRUD) until JWT in later phase |

## Endpoints

### System
- `GET /api/health/` → `{ status, service, slogan }`

### Site
- `GET /api/site-settings/` → brand, slogan, logo, contact, currency
- `PUT|PATCH /api/site-settings/` → staff; multipart logo upload supported

### Catalogue
- `GET|POST /api/categories/`
- `GET|PUT|PATCH|DELETE /api/categories/{slug}/`
- `GET|POST /api/products/`
  - Query: `category`, `category__slug`, `is_featured`, `is_active`, `search`, `ordering`, `page`
- `GET|PUT|PATCH|DELETE /api/products/{slug}/`
- `GET|POST /api/product-images/` (multipart `image`)
- `GET|PUT|PATCH|DELETE /api/product-images/{id}/`

### Users (staff/admin)
- `GET|POST /api/users/`
- `GET|PUT|PATCH|DELETE /api/users/{id}/`
- `GET /api/users/me/`

## Resource shapes (simplified)

```yaml
Category:
  id: int
  name: string
  slug: string
  parent: int|null
  description: string
  sort_order: int
  is_active: bool

Product:
  id: int
  name: string
  slug: string
  sku: string
  description: string
  price: decimal
  compare_at_price: decimal|null
  stock: int
  category: int
  is_featured: bool
  is_active: bool
  images: ProductImage[]  # detail only

ProductImage:
  id: int
  product: int
  image: url
  alt_text: string
  sort_order: int

SiteSettings:
  site_name: string
  slogan: string        # default: Your trust, our commitment
  logo / logo_url: url
  contact_email: string
  contact_phone: string
  contact_address: string
  about_blurb: string
  currency: string      # default: PKR
```

## Planned (later phases)
- JWT auth for React admin
- Payment webhooks (Phase 5)

## Commerce (Phase 4)

### Cart
- `GET /api/cart/` — get/create cart (`X-Cart-Key` header)
- `DELETE /api/cart/` — clear items
- `POST /api/cart/items/` — `{ product_id, quantity }`
- `PATCH /api/cart/items/{id}/` — `{ quantity }`
- `DELETE /api/cart/items/{id}/`
- `POST /api/cart/sync/` — replace from client `[{ product_id, quantity }]`

### Checkout & orders
- `POST /api/checkout/` — place order (validates stock, decrements inventory, emails console)
- `GET /api/orders/by-number/{order_number}/` — confirmation lookup
- `GET /api/orders/` — staff list
- `PATCH /api/orders/{order_number}/` — staff status / tracking update

### Order statuses
`pending` → `paid` → `processing` → `shipped` → `delivered` · or `cancelled`
