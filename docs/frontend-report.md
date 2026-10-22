# BuyCart — Frontend Mini Project Report

**App:** BuyCart (e-commerce store for phones)
**Stack:** Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · GSAP · plain CSS
**Entry:** `apps/frontend` (port 3000, rewrites `/api/*` to the backend)

---

## 1. Project Structure

```
app/
├── (shop)/            Storefront: home, products, product detail, cart, orders
├── (auth)/            login, register, verify (OTP), forgot-password
├── admin/             Admin area: dashboard, orders, products, analytics, users
├── terms/, privacy/   Static legal pages
components/
├── layout/            Navbar, footer
├── home/              Hero, categories, brand loop, product carousel
├── products/          Product cards, media, detail view
├── auth/              Shared auth form + brand panel
├── admin/ (in app/)   AdminGate, shared helpers, data-loading hook
├── ui/, icons/, animations/  Button, Input, Modal, Loader, icons, splash
lib/                   api.js (HTTP client), auth.js, cart.js (stores)
data/                  price formatting + catalog helpers
```

Route groups `(shop)` and `(auth)` give each area its own layout without affecting URLs.

## 2. Features Implemented

### 2.1 Storefront
- **Home page** — animated **hero** with scroll-driven parallax (panels slide and fade as you scroll, built on IntersectionObserver + rAF, no heavy dependencies), category grid, brand marquee loop, and a featured-product carousel.
- **One-time splash intro** — a multi-scene animated intro plays once per browser-tab session (`sessionStorage` flag); the real page renders *behind* the overlay so nothing is delayed and the fade-out reveals live content.
- **Products listing** — loads the catalog **live from the API**, with client-side **sorting** (featured, price ↑/↓, A–Z), per-brand accent colors, discount badge showing savings %, and quick add-to-cart from the card.
- **Product detail** — image gallery with fallback brand-colored phone art when a product has no photo, **stock indicator** ("only N left" for low stock, out-of-stock state), **quantity picker** (capped at 10), add-to-cart, and related products.
- **Cart page** — quantity change, remove, clear, live subtotal; **checkout** pushes the cart to the server, creates the order in MongoDB, then empties the local bag; signed-out visitors are handed to login and returned afterwards.
- **Order history** — customer's past orders from the API with product thumbnails, totals and status.

### 2.2 Authentication
- **Register → OTP verify → login** flow with a **resend-code** button and 30-second cooldown on the verify screen; if email delivery fails after the account is created, registration routes users straight to verify instead of dead-ending.
- **Shared auth form component** — one `AuthForm` powers login/register/forgot-password (fields, icons, validation, loading states, error display, extensible via a render-function slot), with a branded side panel and Google/Apple OAuth buttons.
- **Session store** (`lib/auth.js`) — the JWT lives in an HTTP-only cookie, so the app asks `GET /api/auth/me` **once per page load** and shares the result through a tiny external store (`useSyncExternalStore`); navbar, cart and every gated page agree on the session without duplicate requests or prop drilling.
- **Smart redirects** — `?next=` support returns users to where they were headed; unverified logins are routed to the verify screen automatically.

### 2.3 Cart System
- **Dual-layer cart** — a **localStorage-backed store** (`lib/cart.js`) works signed-out and survives reloads; it uses `useSyncExternalStore` so server and client renders stay identical (no hydration mismatches), broadcasts same-tab changes via custom events, and syncs across tabs via the native `storage` event.
- **CartSync reconciler** — on sign-in, an empty local bag adopts the account's server cart; a filled local bag wins and is pushed up. Checkout pushes again before ordering, so a failed background sync can never break a purchase.

### 2.4 Layout & Navigation
- **Sticky glass navbar** — brand, primary links, live **cart badge** (item count), and a session-aware right slot: "Log in" for visitors, orders + logout for users, plus an extra **Admin** link for admins.
- Responsive footer with auto-updating copyright year; full mobile menu.

### 2.5 Admin Area (all live from the API)
- **Access gate** — `AdminGate` checks the session client-side and bounces non-admins to login (the API independently enforces admin-only on every endpoint — the gate is UX, not security).
- **Dashboard** — real totals (sales, orders, products, users) and the five most recent orders with status badges.
- **Orders** — every customer's order, newest first; detail page shows customer, items, per-item subtotals and a **working status dropdown** (`pending → confirmed → shipped → delivered` / `cancelled`) that saves through the API and reflects instantly.
- **Products** — list with **create/edit/delete**; the product form handles **multi-image upload** (up to 5 photos) with previews of existing images.
- **Analytics** — revenue, order count, average order value, a **5-month revenue bar chart** (scaled to the busiest month) and **top 5 best-sellers** by units sold.
- **Users** — every account with role badge, order count, lifetime spend and join date.
- Shared internals: `useAdminData` hook (one line to load/loading/error/retry logic, free of render-cascade bugs) and a `shared.js` for status-badge colors and date/customer formatting, so every admin screen behaves identically.

### 2.6 API Client & Data Layer
- **Thin fetch wrapper** (`lib/api.js`) — same-origin calls through the Next.js rewrite (cookies sent automatically, no CORS preflight), automatic absolute URLs for server components, a typed `ApiError` carrying HTTP status, JSON + multipart support, and Mongo→UI product shape normalization.
- **Loading/error UX everywhere** — every data screen has explicit loading, empty and error states with a "Try again" retry, never a blank screen.

### 2.7 Design & Polish
- Hand-rolled CSS per area (no UI framework): glass navbar, product cards, admin dashboard theme; per-brand fonts/colors for phone brands; consistent button/input/badge/modal primitives in `components/ui`.
- GSAP-powered animations (hero, carousel) kept off the critical path; splash plays once per session.
- Accessibility basics throughout: labels, `aria-live` status regions, keyboard-operable quantity pickers and menus.

## 3. Pages Summary

| Route | Purpose |
|---|---|
| `/` | Home: hero, categories, brands, featured products |
| `/products`, `/products/:id` | Live catalog with sorting; detail with gallery + add-to-cart |
| `/cart` | Bag management + real checkout against the account |
| `/orders` | Customer order history |
| `/register`, `/verify`, `/login`, `/forgot-password` | Auth flow with OTP + resend |
| `/admin`, `/admin/orders(/:id)`, `/admin/products(/add/:id/edit)`, `/admin/analytics`, `/admin/users` | Full live admin area |
| `/terms`, `/privacy` | Static pages |

## 4. Verification
- **17/17 browser checks** (headless Chrome against the real UI): admin login, every admin page rendering real API data, the order-status dropdown saving and persisting to MongoDB, signed-out redirect, and a clean console.
- ESLint clean on all touched files.
