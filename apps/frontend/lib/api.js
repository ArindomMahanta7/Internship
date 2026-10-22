/* Thin client for the Express API.
 *
 * In the browser every request goes to the same origin: next.config.ts
 * rewrites /api/* to the backend, so cookies (the HTTP-only auth token) are
 * sent automatically and there is no CORS preflight to worry about.
 *
 * Server components can't use a relative URL (Node's fetch has no origin to
 * resolve against), so there we call the backend directly. */
const SERVER_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function resolveUrl(path) {
  // Already absolute (or a non-http scheme) - leave it alone.
  if (/^(https?:)?\/\//i.test(path)) return path;
  // In the browser, a leading-slash path resolves against this origin, which
  // is exactly what we want (the rewrite forwards it).
  if (typeof window !== "undefined") return path;
  return `${SERVER_ORIGIN}${path}`;
}

async function request(path, { method = "GET", body, formData } = {}) {
  const init = { method, credentials: "include", headers: {} };

  if (formData) {
    init.body = formData; // browser sets the multipart boundary itself
  } else if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(resolveUrl(path), init);
  } catch {
    throw new ApiError("Cannot reach the server. Is the backend running?", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON body (proxy/502 page) - fall through with data = null.
  }

  if (!res.ok) {
    throw new ApiError(data?.message ?? `Request failed (${res.status})`, res.status);
  }

  return data;
}

/* ── product shape ────────────────────────────────────────────────────────
 * The API returns Mongo documents ({ brandName, modelName, _id, ... });
 * the UI reads the flatter shape the static catalog used
 * ({ id, brand, name, ... }). Normalise once, here, so components stay
 * unaware of the database. */
export function normalizeProduct(doc) {
  if (!doc) return null;
  return {
    id: doc._id ?? doc.id,
    brand: doc.brandName ?? "",
    name: doc.modelName ?? "",
    tagline: doc.tagline ?? "",
    description: doc.description ?? "",
    price: Number(doc.price ?? 0),
    oldPrice: doc.oldPrice ?? null,
    color: doc.color ?? "#3b82f6",
    badge: doc.badge ?? null,
    stock: Number(doc.stock ?? 0),
    images: Array.isArray(doc.images) ? doc.images : [],
    createdAt: doc.createdAt,
  };
}

/* Cart items in storage are keyed by product id and carry a subset of the
 * product fields; this rebuilds one from a populated API cart item. */
export function normalizeCartItem(item) {
  const product = item?.product;
  if (!product || typeof product !== "object") return null;

  const normalized = normalizeProduct(product);
  return { ...normalized, qty: Number(item.quantity ?? 1) };
}

/* ── products ────────────────────────────────────────────────────────────*/
export async function fetchProducts() {
  const data = await request("/api/product");
  return (data.products ?? []).map(normalizeProduct);
}

export async function fetchProduct(id) {
  const data = await request(`/api/product/${encodeURIComponent(id)}`);
  return normalizeProduct(data.product);
}

/* ── auth ────────────────────────────────────────────────────────────────*/
export async function fetchMe() {
  const data = await request("/api/auth/me");
  return data.user ?? null;
}

export async function login(identifier, password) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: { email: identifier, password },
  });
  return data.user;
}

export async function register({ name, email, password }) {
  return request("/api/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export async function verifyOtp(email, otp) {
  return request("/api/auth/verify-email", {
    method: "POST",
    body: { email, otp },
  });
}

/* Fresh OTP when the first one expired or never arrived. Resolves with
 * { message, alreadyVerified? } - alreadyVerified means the account is done
 * and the caller should send the visitor to the login screen. */
export async function resendOtp(email) {
  return request("/api/auth/resend-otp", {
    method: "POST",
    body: { email },
  });
}

export async function logout() {
  return request("/api/auth/logout", { method: "POST" });
}

/* ── cart ────────────────────────────────────────────────────────────────*/
export async function pushCart(items) {
  return request("/api/cart", {
    method: "PUT",
    body: {
      items: items.map((item) => ({ product: item.id, quantity: item.qty })),
    },
  });
}

export async function pullCart() {
  const data = await request("/api/cart");
  const items = (data.cart?.items ?? data.items ?? [])
    .map(normalizeCartItem)
    .filter(Boolean);
  return items;
}

/* ── orders ──────────────────────────────────────────────────────────────*/
export async function createOrder() {
  return request("/api/orders", { method: "POST" });
}

export async function fetchOrders() {
  const data = await request("/api/orders");
  return data.orders ?? [];
}

/* ── admin ───────────────────────────────────────────────────────────────*/
export async function createProduct(formFields) {
  const formData = toFormData(formFields);
  return request("/api/product/create", { method: "POST", formData });
}

export async function updateProduct(id, formFields) {
  const formData = toFormData(formFields);
  return request(`/api/product/${encodeURIComponent(id)}`, {
    method: "PUT",
    formData,
  });
}

export async function deleteProduct(id) {
  return request(`/api/product/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/* ── admin ────────────────────────────────────────────────────────────────
 * These hit /api/admin/*, which requires an admin session cookie. The
 * dashboard/orders/users/analytics screens are all client components that
 * load through these. */
export async function fetchAdminStats() {
  const data = await request("/api/admin/stats");
  return data; // { stats: { sales, orders, products, users }, recentOrders }
}

export async function fetchAllOrders() {
  const data = await request("/api/admin/orders");
  return data.orders ?? [];
}

export async function fetchAdminOrder(id) {
  const data = await request(`/api/admin/orders/${encodeURIComponent(id)}`);
  return data.order;
}

export async function updateOrderStatus(id, status) {
  const data = await request(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { status },
  });
  return data.order;
}

export async function fetchAllUsers() {
  const data = await request("/api/admin/users");
  return data.users ?? [];
}

export async function fetchAnalytics() {
  const data = await request("/api/admin/analytics");
  return data; // { stats, monthly, topProducts }
}

/* Build a multipart body: scalar fields go in as strings, `images` (a
 * FileList or File[]) is appended under the "images" key the API expects. */
function toFormData(fields) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;

    if (key === "images") {
      const files = Array.isArray(value) ? value : Array.from(value);
      for (const file of files) formData.append("images", file);
      continue;
    }

    formData.append(key, String(value));
  }

  return formData;
}
