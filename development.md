# AM Enterprises — Development Plan

**Brand:** AM Enterprises  
**Slogan:** *Your trust, our commitment*  
**Product:** Household products e-commerce storefront + React admin panel  
**Stack:** React (storefront + admin) · Django (API / backend)  
**Visual system:** Adapted from [`design.md`](./design.md) — editorial brutalism on white paper (monochrome ink, pill ghost buttons, typography-led layout, flat surfaces, no shadows/gradients)

---

## 1. Project summary

Build a full e-commerce website for AM Enterprises with:

| Surface | Pages / areas |
|---------|----------------|
| **Storefront** | Landing, product catalogue, product detail, about, cart, checkout |
| **Admin panel** | Auth, dashboard, full CRUD for products/categories/orders/customers/content, site settings |
| **Backend** | Django REST API, auth, cart/orders, payments hooks, media, admin APIs |

**Assets:** Logo at `logo.jpg` · Seed products loaded via `seed_catalog` · Domain pending · Hosting: Railway

---

## 2. Design adaptation (from `design.md`)

Keep the Eindhoven-style editorial system; remap content to retail, not magazine articles.

| Token / rule | Storefront use |
|--------------|----------------|
| Charcoal / paper / newsprint | All UI chrome, text, section bands |
| Signal red `#ff0000` | Category labels, “Sale”, order status chips only — never buttons |
| Pill ghost / filled buttons | CTAs: Shop, Add to cart, Checkout, Admin primary actions |
| Display type | Hero brand lockup: **AM Enterprises** + slogan |
| Flat cards (0 radius, no shadow) | Product tiles, order rows, admin tables |
| Max width ~1200px | Catalogue grids, checkout forms |
| Section rhythm | Alternate `#ffffff` / `#e8e8e8` |

**Admin panel:** same tokens for cohesion (black/white, pills, hairline borders). Prefer denser layouts (tables, filters, forms) while staying flat and typographic — not a purple dashboard look.

---

## 3. Proposed architecture

```
AM enterprises/              # single git repo
├── backend/                 # Django + DRF
│   ├── config/              # settings, urls, asgi
│   ├── apps/
│   │   ├── accounts/        # users, roles (admin / staff) ✅
│   │   ├── catalog/         # categories, products, images ✅
│   │   ├── content/         # site settings ✅
│   │   ├── cart/            # Phase 4
│   │   ├── orders/          # Phase 4
│   │   ├── payments/        # Phase 5
│   │   └── analytics/       # optional
│   └── media/
└── frontend/                # React (Vite) — storefront + /admin shell
    └── src/
```

**API style:** Django REST Framework (JSON), session/basic auth for staff writes (JWT later), public read for catalogue.  
**Media:** Cloudflare R2 bucket `am-media` — Railway DB stores `image_url` / `logo_url` only.  
**Payments:** abstract provider interface — **gateway to be provided by the client** (Phase 5). COD + bank transfer already selectable at checkout.  
**Hosting:** Railway (backend + frontend services). Domain: not purchased yet.  
**Currency default:** PKR

---

## 4. Development phases

### Phase 0 — Discovery & foundations ✅ DONE
**Goal:** Lock scope, brand assets, and project scaffolding.

- [x] Collect logo, product photos, category list, shipping/payment preferences, currency
  - Logo: `logo.jpg` · Seed household categories/products · Currency: PKR · Payments: deferred to Phase 5
- [x] Confirm domain, hosting — **Railway**; domain not purchased yet
- [x] Scaffold monorepo: `backend/` + `frontend/` (admin lives under `/admin` in frontend)
- [x] Wire design tokens from `design.md` into CSS variables / Tailwind theme (`frontend/src/index.css`)
- [x] Define API contract outline (`docs/openapi-sketch.md` + live `/api/docs/`)
- [x] Animation shortlist + `prefers-reduced-motion` policy (`frontend/src/lib/motion.ts`, §5)

**Exit criteria:** ✅ Repo runs React shell + Django health API; design tokens imported; asset checklist complete.

---

### Phase 1 — Django core & data model ✅ DONE
**Goal:** Solid backend for catalogue and users.

- [x] Django project, apps, env config, CORS for React
- [x] Models:
  - [x] `Category` (name, slug, parent optional, sort order, active)
  - [x] `Product` (name, slug, SKU, description, price, compare_at, stock, category, featured, active)
  - [x] `ProductImage` (product, image, alt, sort)
  - [x] `User` / roles (`customer` / `staff` / `admin`, `is_staff`)
  - [x] `SiteSettings` (logo, slogan, contact, about blurb)
- [x] Admin-ready serializers + CRUD ViewSets
- [x] Image upload endpoints (`/api/product-images/`, site logo via `/api/site-settings/`)
- [x] Seed script with placeholder products (`python manage.py seed_catalog`)

**Exit criteria:** ✅ Categories/products via API/Django admin; media + logo wired; seed loads 5 categories / 14 products.  
**Demo admin:** `admin` / `admin123`

---

### Phase 2 — Design system & shared UI kit ✅ DONE
**Goal:** Reusable React components matching `design.md`.

- [x] Typography scale, spacing, colors as CSS variables (`frontend/src/index.css`)
- [x] Components: PillGhostButton, PillFilledButton, NavBar, Footer, SectionBand, ProductCard, Tag/Label, Input, Select, Modal, EmptyState
- [x] Layout shells for storefront and admin (`StorefrontLayout`, `AdminLayout`)
- [x] Responsive breakpoints (mobile-first product grid, nav, admin sidebar)

**Exit criteria:** ✅ `/ui` sandbox shows all atoms; storefront + admin share the same tokens/components.

---

### Phase 3 — Storefront pages (static → API) ✅ DONE
**Goal:** Full public site structure with real catalogue data.

| Page | Scope | Status |
|------|--------|--------|
| **Landing** | Hero, featured products, trust strip, CTA | ✅ |
| **Catalogue** | Grid, filters, sort, search, pagination | ✅ |
| **Product detail** | Gallery, price, stock, description, add to cart | ✅ |
| **About** | Company story + contact from SiteSettings | ✅ |
| **Cart** | Line items, qty, remove, subtotal | ✅ |
| **Checkout** | Address / shipping / payment steps + confirmation | ✅ (order mocked locally) |

- [x] Client cart (context + localStorage)
- [x] Routing + page titles / meta description
- [x] Loading / empty / error states

**Exit criteria:** ✅ Browse → detail → cart → checkout UI against live catalogue API (payment/order persistence still mock until Phase 4–5).

---

### Phase 4 — Cart, checkout & orders (backend) ✅ DONE
**Goal:** Real commerce flow.

- [x] Cart API (guest via `X-Cart-Key` + logged-in merge)
- [x] Checkout validation, stock reservation / decrement
- [x] `Order`, `OrderItem`, statuses: `pending → paid → processing → shipped → delivered / cancelled`
- [x] Email notifications (order confirmation — console backend)
- [x] Order confirmation page + real `order_number`

**Exit criteria:** ✅ End-to-end order created in DB from storefront checkout (COD / bank transfer pending; gateway in Phase 5).

**Key endpoints:** `GET/DELETE /api/cart/` · `POST /api/cart/items/` · `POST /api/cart/sync/` · `POST /api/checkout/` · `GET /api/orders/by-number/{order_number}/`

---

### Phase 5 — Payments & fulfillment hooks  
**Goal:** Production-ready money path.

**Dependency:** Payment gateway credentials, docs, and sandbox access will be **provided by the client**. Do not hardcode a vendor until those materials arrive.

- [ ] Keep COD + bank transfer working as offline methods (already in checkout)
- [ ] Build `apps.payments` with a pluggable **PaymentProvider** interface (create intent / redirect / verify / webhook)
- [ ] Wire client gateway adapter once credentials + API docs are shared
- [ ] Webhooks / success-failure redirects — mark `paid` only after verified success
- [ ] Admin order status updates + optional tracking number
- [ ] Tax/shipping rules (flat rate already; zone-based optional v1)

**Blocked on client:**
- Gateway name / vendor
- Merchant / API keys (sandbox + live)
- Webhook signing secret
- Allowed currencies / redirect URLs
- Any brand requirements for the pay page

**Exit criteria:** Sandbox payment succeeds with the client’s gateway; failed / abandoned payments do not mark the order `paid`.

---

### Phase 6 — Admin panel (React) ✅ DONE
**Goal:** Polished control center with full CRUD and site control.

**Auth**
- [x] Login, logout, protected routes, role checks (`/admin/login`, session + CSRF)

**Dashboard**
- [x] KPI strip: orders today, revenue, low stock, pending + recent orders

**CRUD modules**
- [x] Products (list, create, edit, delete, image upload, publish/unpublish, featured)
- [x] Categories
- [x] Orders (list, detail, status transitions, notes, tracking)
- [x] Customers (from order history)
- [x] Site settings (logo, slogan, about, contact, currency)
- Coupons / discounts (optional v1.1 — deferred)

**UX**
- [x] Data tables with search/filters
- [x] Toast confirmations
- [x] Same design tokens as storefront

**Exit criteria:** ✅ Admin can fully run the shop from `/admin` (seed user `admin` / `admin123`).

**API:** `/api/auth/*` · `/api/admin/stats/` · `/api/admin/customers/`

---

### Phase 7 — Motion & polish ✅ DONE
**Goal:** Editorial motion from React Bits + custom micro-interactions (see §5).

- [x] Full §5.2 storefront set (SplitText, BlurText, ScrollReveal/Float, TrueFocus, Fade/Animated Content, GradualBlur, ScrollExpand, HalftoneReveal, AnimatedList, StaggeredMenu, PillNav, Carousel, Masonry, ChromaGrid, ScrollStack, Stepper, CountUp, FoldText)
- [x] §5.3 admin (Counter KPIs, FadeContent, Stepper on product form)
- [x] §5.4 optional (Magnet, TargetCursor, Noise, AccordionGallery, LogoLoop, TextType)
- [x] Page transitions, cart badge pulse, add-to-cart feedback
- [x] Image lazy-load + skeleton bands (`#e8e8e8`)
- [x] Accessibility: skip link, focus rings, Escape closes menu, reduced motion
- [x] Landing aligned to `design.md` (asymmetric hero, collage, Menu ≡ overlay, trichromatic + signal red labels)

**Exit criteria:** ✅ Motion map §5.6 wired; design.md chrome/hero respected; reduced-motion path snaps to final state.

---

### Phase 8 — QA, hardening & launch  
**Goal:** Ship.

- Auth/security review (CORS, CSRF, rate limits, file upload validation)
- E2E smoke tests: catalogue, checkout, admin CRUD
- SEO, sitemap, robots, analytics
- Production env, backups, SSL, CDN for media
- Soft launch checklist + content freeze with your real logo/images

**Exit criteria:** Production URL live; admin credentials handed over; runbook documented.

---

## 5. Animation research ([React Bits](https://reactbits.dev/))

Source: [React Bits](https://reactbits.dev/) — free, copy-paste / CLI components (JS|TS × CSS|Tailwind), often powered by GSAP or Motion. Prefer **restraint**: motion should support typography and photography, not fight the flat editorial system. Avoid glow, glass, neon, particle fireworks, and busy shader backgrounds on the storefront.

### 5.1 Animation principles for AM Enterprises

1. **Typography first** — hero and section titles animate; chrome stays quiet  
2. **No elevation theater** — no shadow bounce, no glassmorphism  
3. **Photography earns motion** — gentle reveal / expand, not sticker peel or sparkle borders  
4. **Commerce clarity** — cart/checkout motion must never hide price, stock, or errors  
5. **Always honor `prefers-reduced-motion`** — snap to final state  

### 5.2 Recommended — storefront (high fit)

| Component | React Bits | Where to use | Why it fits |
|-----------|------------|--------------|-------------|
| **Split Text** | [Split Text](https://reactbits.dev/text-animations/split-text) | Hero: “AM Enterprises” | Staggered editorial entrance; matches oversized display type |
| **Blur Text** | [Blur Text](https://reactbits.dev/text-animations/blur-text) | Slogan: *Your trust, our commitment* | Soft resolve into clarity — trust metaphor without gimmicks |
| **Scroll Reveal** | [Scroll Reveal](https://reactbits.dev/text-animations/scroll-reveal) | About + landing body copy | Unblur on scroll; magazine pacing |
| **Scroll Float** | [Scroll Float](https://reactbits.dev/text-animations/scroll-float) | Display headlines in long sections | Subtle parallax; keep amplitude low |
| **True Focus** | [True Focus](https://reactbits.dev/text-animations/true-focus) | Trust / values line on About | Words sharpen in sequence — on-brand for the slogan |
| **Fade Content** | [Fade Content](https://reactbits.dev/animations/fade-content) | Section bands, product grids | Default entrance wrapper |
| **Animated Content** | [Animated Content](https://reactbits.dev/animations/animated-content) | Product cards, footer columns | Directional slide-in with delay stagger |
| **Gradual Blur** | [Gradual Blur](https://reactbits.dev/animations/gradual-blur) | Hero photo collage | Cinematic photo reveal without filters |
| **Scroll Expand** | [Scroll Expand](https://reactbits.dev/animations/scroll-expand) | Featured product or lifestyle shot | Frame grows toward full-bleed (adapt radius → **0** for design system) |
| **Halftone Reveal** | [Halftone Reveal](https://reactbits.dev/animations/halftone-reveal) | About / brand story imagery | Print-like; aligns with editorial / newsprint aesthetic |
| **Animated List** | [Animated List](https://reactbits.dev/components/animated-list) | Catalogue filter results, cart lines | Staggered list polish |
| **Staggered Menu** | [Staggered Menu](https://reactbits.dev/components/staggered-menu) | Fullscreen mobile/desktop nav overlay | Matches design.md “Menu ≡” overlay pattern |
| **Pill Nav** | [Pill Nav](https://reactbits.dev/components/pill-nav) | Storefront or admin secondary nav | Native pill language of the design system |
| **Carousel** | [Carousel](https://reactbits.dev/components/carousel) | Product image gallery on PDP | Practical; keep UI chrome minimal |
| **Masonry** | [Masonry](https://reactbits.dev/components/masonry) | Optional lifestyle / lookbook band | Asymmetric photo placement like design.md hero collage |
| **Chroma Grid** | [Chroma Grid](https://reactbits.dev/components/chroma-grid) | Featured products (start grayscale → color on hover) | Strong product moment; use sparingly |
| **Scroll Stack** | [Scroll Stack](https://reactbits.dev/components/scroll-stack) | Landing “bestsellers” storytelling | Depth via stack, not drop shadows |
| **Stepper** | [Stepper](https://reactbits.dev/components/stepper) | Checkout steps | Clear progress without decorative chrome |
| **Count Up** | [Count Up](https://reactbits.dev/text-animations/count-up) | Optional trust stats (years, SKUs) — **not** in first viewport | Keep hero sparse per design rules |
| **Fold Text** | [Fold Text](https://reactbits.dev/text-animations/fold-text) | Section titles | Paper-fold metaphor fits “white paper” theme |

### 5.3 Recommended — admin panel

| Component | Use |
|-----------|-----|
| **Fade Content / Animated Content** | Panel mounts, table row enter |
| **Animated List** | Notification feed, activity log |
| **Stepper** | Multi-step product create wizard |
| **Counter** | Dashboard KPI numbers |
| **Pill Nav** | Admin section switcher |

Keep admin motion shorter and faster than the marketing site (productivity > spectacle).

### 5.4 Optional / use carefully

| Component | Note |
|-----------|------|
| **Magnet** | Subtle attract on primary CTAs only |
| **Target Cursor** | Desktop-only brand flourish; disable on touch / reduced motion |
| **Noise** | Very low opacity film grain on paper white — optional texture |
| **Accordion Gallery** | Category storytelling on landing |
| **Logo Loop** | Partner / certification logos if needed later |
| **Text Type** | One-shot slogan intro — do not loop forever |

### 5.5 Avoid on this brand (conflicts with `design.md`)

Skip or heavily restyle: Aurora, Plasma, Galaxy, Liquid Chrome, Electric Border, Star Border, Border Glow, Fluid Glass, Glitch Text, Gradient Text, ShinyText, Splash Cursor, Meta Balls, Ballpit, Hyperspeed, and similar glow/shader/party effects. They break the monochrome flat editorial contract.

### 5.6 Suggested motion map by page

**Landing (first viewport)**  
1. Split Text → brand name  
2. BlurText → slogan *Your trust, our commitment*  
3. GradualBlur / FadeContent → product photo crops  

**Below fold**  
- ScrollReveal on intro copy  
- AnimatedContent stagger on featured product grid  
- Optional ScrollStack or ChromaGrid for one featured band only  

**Catalogue**  
- FadeContent on grid; AnimatedList when filters change  

**Product detail**  
- FadeContent on info column; Carousel for images; Magnet on “Add to cart” (optional)  

**About**  
- TrueFocus or ScrollReveal on trust copy; HalftoneReveal on archival/product photos  

**Cart / Checkout**  
- AnimatedList for lines; Stepper for checkout; minimal flourish — clarity first  

**Admin**  
- Counter on KPIs; FadeContent on tables; Stepper on create flows  

### 5.7 Implementation notes

- Install only needed bits via [React Bits installation](https://reactbits.dev/get-started/installation) (shadcn or jsrepo CLI), e.g. `SplitText`, `BlurText`, `FadeContent`
- Prefer **TypeScript + Tailwind** variants to match a Vite/React Tailwind setup
- Centralize a `<Motion>` policy helper: if `prefers-reduced-motion`, render children static
- Budget: **2–3 intentional motions** on marketing pages; fewer on cart/checkout/admin

---

## 6. Feature checklist (MVP)

### Storefront
- [x] Landing with brand + slogan
- [x] Catalogue (filter, sort, search)
- [x] Product detail + gallery
- [x] About
- [x] Cart
- [x] Checkout + order confirmation
- [x] Responsive + accessible baseline

### Admin
- [x] Auth
- [x] Dashboard metrics
- [x] Products CRUD + images
- [x] Categories CRUD
- [x] Orders manage + status
- [x] Site settings (logo, slogan, about, featured)
- [x] Customers view

### Backend
- [x] Catalogue & media APIs
- [x] Cart & checkout APIs
- [x] Orders & inventory
- [x] Admin-secured endpoints (staff write / public read)
- [ ] Payment sandbox hook

---

## 7. Suggested timeline (flexible)

| Phase | Rough duration | Status |
|-------|----------------|--------|
| 0 Foundations | 3–5 days | ✅ Done |
| 1 Django models & API | 1–1.5 weeks | ✅ Done |
| 2 Design system | 3–5 days | ✅ Done |
| 3 Storefront pages | 1.5–2 weeks | ✅ Done |
| 4 Cart & orders | 1 week | ✅ Done |
| 5 Payments | 3–5 days | Waiting on client gateway |
| 6 Admin panel | 1.5–2 weeks | ✅ Done |
| 7 Motion & polish | 3–5 days | ✅ Done |
| 8 QA & launch | 3–5 days | Next |

**MVP target:** ~7–9 weeks part-time / ~5–6 weeks focused full-time (depends on payment complexity and asset readiness).

---

## 8. Next actions

1. ~~Share logo~~ — done (`logo.jpg`)
2. ~~Payment gateway~~ — **client will provide** (Phase 5 blocked on credentials/docs)
3. ~~Currency~~ — default **PKR** (changeable in SiteSettings)
4. ~~Repo layout~~ — single monorepo: `backend/` + `frontend/`
5. ~~Start Phase 2~~ — UI kit live at `/ui`
6. ~~Start Phase 3~~ — storefront browse → cart → checkout complete
7. ~~Start Phase 4~~ — Django cart/orders + real order numbers
8. ~~Phase 6~~ — React admin panel live at `/admin`
9. ~~Phase 7~~ — editorial motion + a11y polish
10. **Next:** Phase 8 QA & launch · or Phase 5 when client gateway arrives
11. Optional: replace seed product placeholder photos with real product images

---

## 9. Document map

| File | Role |
|------|------|
| [`design.md`](./design.md) | Visual tokens, components, do/don’t |
| [`development.md`](./development.md) | Phases, architecture, animation research |
| [`docs/openapi-sketch.md`](./docs/openapi-sketch.md) | API contract outline |
| [`README.md`](./README.md) | Run instructions |

*Slogan locked in product copy and `SiteSettings` default:* **Your trust, our commitment**
