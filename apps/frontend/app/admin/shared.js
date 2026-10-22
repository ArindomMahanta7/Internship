/* Bits shared by the /admin screens: the status badge palette, a date
 * formatter, and the order shape normaliser. Kept here so every page agrees
 * on how a status maps to a colour. */

const BADGE = {
  pending: "yellow",
  confirmed: "blue",
  shipped: "blue",
  delivered: "green",
  cancelled: "red",
};

export function badgeClass(status) {
  const key = String(status ?? "pending").toLowerCase();
  return `admin-badge ${BADGE[key] ?? "yellow"}`;
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* The API returns Mongo docs; `user` may be a populated object or, for old
 * rows, just an id. Fall back gracefully either way. */
export function customerName(order) {
  if (order?.user && typeof order.user === "object") return order.user.name;
  return "Unknown customer";
}

export function customerEmail(order) {
  if (order?.user && typeof order.user === "object") return order.user.email;
  return "—";
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];
