/* Formatting helpers shared across the storefront.
 *
 * The product catalog itself now lives in the API (MongoDB) and is fetched
 * through lib/api.js - see apps/backend/src/seed.js to add records. Only the
 * price formatter still lives here. */

/* ₹ with Indian grouping, no decimals (e.g. 129999 -> "₹1,29,999"). */
export function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}
