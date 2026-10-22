# BuyCart — Backend Mini Project Report

**App:** BuyCart (e-commerce store for phones)
**Stack:** Node.js · Express 5 · MongoDB Atlas (Mongoose) · JWT · Nodemailer · Cloudinary
**Entry:** `apps/backend/src/app.js` (port 3001)

---

## 1. Project Structure

```
src/
├── app.js               Express app: CORS, cookies, route mounting, error handler
├── config/              db.js (Mongo connection), cloudinary.js (upload service)
├── models/              user, product, cart, order schemas (Mongoose)
├── controllers/         auth, product, cart, order, admin business logic
├── routes/              auth, product, cart, order, admin route definitions
├── middleware/          authenticate (JWT), admin (role check), upload (multer)
├── utils/               otp.js (crypto OTP), sendEmail.js (SMTP)
└── seed.js              Idempotent catalog seeder
```

## 2. Features Implemented

### 2.1 Authentication & Accounts
- **Register** with full server-side validation (required fields, type checks, password ≥ 8 chars, email normalization to lowercase) and **bcrypt** password hashing (10 salt rounds).
- **Email OTP verification** — a 6-digit code generated with `crypto.randomInt` (cryptographically secure, not `Math.random`), stored on the user with a **5-minute expiry**, emailed through Gmail SMTP.
- **Resend OTP** endpoint with a **30-second cooldown**; responses never reveal whether an account exists (no user enumeration).
- **No dead-end auth states** — re-registering an unverified account issues a fresh OTP instead of a 409; verifying an already-verified account returns success instead of an error. A user can always get back in.
- **Login** verifies the bcrypt hash and issues a **JWT stored in an HTTP-only cookie** (never readable by JavaScript — XSS-safe session).
- **Logout** clears the cookie; **`GET /api/auth/me`** resolves the cookie into the current user so the client can render the session.
- **Roles** — every account is `user` or `admin`; a dedicated `adminOnly` middleware gates admin endpoints.

### 2.2 Product Catalog
- **Full CRUD** (create / read / update / delete) restricted to admins.
- **Image upload** — up to 5 photos per product via Multer, pushed to **Cloudinary**; if Cloudinary isn't configured, files fall back to a local `/uploads` folder served statically by Express, so the flow never breaks in development.
- **Brand filter** route (`GET /api/product/brand/:brandName`), registered before `/:id` so the literal path isn't swallowed as an id.
- Product schema supports storefront needs: `tagline`, struck-through `oldPrice`, marketing `badge`, theme `color`, and `stock`.
- **Seed script** (`node src/seed.js`) downloads freely-licensed phone photos and upserts catalog rows — idempotent, safe to re-run.

### 2.3 Shopping Cart
- Per-user cart document with **add, update quantity, remove item, clear, and full replace** endpoints.
- Server-side validation everywhere: product must exist, quantity must be a positive integer.
- **Bulk replace** endpoint lets the browser sync its local cart up in one call.

### 2.4 Orders
- **Checkout** builds the order from the *server-side* cart — items, quantities, and **prices snapshotted at purchase time** so later price changes never rewrite order history; total computed server-side (never trusted from the client).
- **Human-friendly order reference** (`BC-4F2K9XA`) generated once per order in a pre-save hook; existing orders are never re-rolled.
- **Order lifecycle** — `pending → confirmed → shipped → delivered` (+ `cancelled`), enforced by a schema enum.
- Customers can list **their own** orders and view one by id; ownership is checked, so no user can read another's order.

### 2.5 Admin API (`/api/admin/*`)
All endpoints sit behind **authenticate + adminOnly** — the API, not the UI, is the real protection.
- **Dashboard stats** — total sales, order count, product count, user count, plus the 5 most recent orders.
- **All orders** (any customer) with user and product data populated; single-order fetch; **status update** endpoint with enum validation.
- **Users list** — every account with per-user **order count and lifetime spend** computed by MongoDB aggregation.
- **Analytics** — total revenue and orders, a **5-month revenue series** (empty months included so charts have no holes, buckets aligned in UTC), and the **top 5 products by units sold**.

### 2.6 Cross-Cutting Concerns
- **Centralized error handler** — Express 5 catches async and middleware errors in one place; nothing crashes the process.
- **CORS with credentials** restricted to the configured client origins (the auth cookie requires this — `*` is never used).
- **Graceful degradation** — missing SMTP or Cloudinary config logs clearly and falls back instead of failing requests.
- **`/health`** endpoint for monitoring; all configuration (DB URL, JWT secret, keys) via `.env`.

## 3. Security Highlights
| Concern | Approach |
|---|---|
| Password storage | bcrypt, 10 rounds |
| Session | JWT in HTTP-only cookie (inaccessible to JS) |
| Admin access | Enforced by middleware on every admin route |
| Price tampering | Totals and item prices computed server-side from DB |
| User enumeration | Auth responses identical for existing/non-existing accounts |
| OTP | Crypto-random, 5-min expiry, 30s resend cooldown |

## 4. API Summary

| Method & Path | Access | Purpose |
|---|---|---|
| `POST /api/auth/register` | Public | Create account + send OTP |
| `POST /api/auth/verify-email` | Public | Verify OTP |
| `POST /api/auth/resend-otp` | Public | Fresh OTP (30s cooldown) |
| `POST /api/auth/login` | Public | Sign in → HTTP-only cookie |
| `POST /api/auth/logout` | Public | Clear cookie |
| `GET /api/auth/me` | Public | Current session (null if signed out) |
| `GET /api/product`, `GET /api/product/:id` | Public | Catalog reads |
| `GET /api/product/brand/:brandName` | Public | Brand filter |
| `POST /api/product/create`, `PUT/DELETE /api/product/:id` | Admin | Catalog writes + image upload |
| `GET/POST/PUT/PATCH/DELETE /api/cart` | Logged in | Cart management |
| `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id` | Logged in | Checkout + order history |
| `GET /api/admin/stats/orders/users/analytics` | Admin | Dashboard, users, analytics |
| `GET /api/admin/orders/:id`, `PATCH .../status` | Admin | Manage any order |

## 5. Verification
- **18/18 automated API checks** passed: every happy path plus the security traps (no cookie → 401, non-admin → 403, invalid status → 400, unknown order id → 404), including a status update verified directly in MongoDB.
