/* Static catalog for the BuyCart home page (and a source the /products page can
 * grow into). Each product's `color` drives the generated phone art, so the
 * cards look like devices without needing image assets. */

export const BRANDS = ["Nokia", "Samsung", "realme", "Redmi", "Micromax"];

export const PRODUCTS = [
  {
    id: "galaxy-s24-ultra",
    brand: "Samsung",
    name: "Galaxy S24 Ultra",
    tagline: "Galaxy AI is here",
    price: 129999,
    oldPrice: 134999,
    rating: 4.8,
    reviews: 2140,
    color: "#2563eb",
    badge: "Flagship",
  },
  {
    id: "realme-narzo-70-turbo",
    brand: "realme",
    name: "Narzo 70 Turbo 5G",
    tagline: "Turbo performance",
    price: 17999,
    oldPrice: 19999,
    rating: 4.5,
    reviews: 8730,
    color: "#f59e0b",
    badge: "Best value",
  },
  {
    id: "redmi-note-13-pro-plus",
    brand: "Redmi",
    name: "Note 13 Pro+ 5G",
    tagline: "200MP pro-grade camera",
    price: 29999,
    oldPrice: 33999,
    rating: 4.6,
    reviews: 5410,
    color: "#a855f7",
    badge: "Hot",
  },
  {
    id: "nokia-g42-5g",
    brand: "Nokia",
    name: "G42 5G",
    tagline: "Built to last",
    price: 12499,
    oldPrice: 14999,
    rating: 4.3,
    reviews: 3120,
    color: "#14b8a6",
    badge: null,
  },
];

/* ₹ with Indian grouping, no decimals (e.g. 129999 -> "₹1,29,999"). */
export function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/* Compact review counts (e.g. 8730 -> "8.7k"). */
export function formatCompact(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(value);
}
