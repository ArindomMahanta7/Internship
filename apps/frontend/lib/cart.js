"use client";

import { useSyncExternalStore } from "react";

/* ── Cart store ──────────────────────────────────────────────────────────
 * A tiny localStorage-backed external store. No provider is needed: any
 * client component can call useCart() to read the cart and change it.
 *
 * Why useSyncExternalStore (instead of useState + useEffect):
 *   - localStorage is an external system. The hook keeps the server and
 *     first client render identical via getServerSnapshot (an empty cart),
 *     so the prerendered HTML never mismatches - React then re-renders
 *     with the real cart right after hydration.
 *   - getCartItems() returns a CACHED array reference between writes;
 *     React needs the snapshot to stay stable or it re-renders forever.
 *   - Same-tab changes are broadcast with a CustomEvent, because the
 *     native "storage" event only fires in OTHER tabs.
 */

const STORAGE_KEY = "buycart-cart";
const CHANGE_EVENT = "buycart-cart-change";
export const MAX_QTY = 10;
const EMPTY_CART = [];

let cache = null; // last parsed cart; invalidated on writes and storage events

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Storage unavailable or corrupt - start from an empty cart.
    return [];
  }
}

function getCartItems() {
  if (cache === null) cache = readStorage();
  return cache;
}

function getServerSnapshot() {
  return EMPTY_CART;
}

function commit(items) {
  cache = items;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full/blocked - the in-memory cart still works this session.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange) {
  const handler = () => {
    cache = null; // cart changed (this tab or another one) - re-read it
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/* Keep only the fields the cart needs, so stored items stay small. */
function pickFields(product) {
  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    tagline: product.tagline,
    price: product.price,
    oldPrice: product.oldPrice ?? null,
    color: product.color,
    badge: product.badge ?? null,
    images: Array.isArray(product.images) ? product.images : [],
    qty: 1,
  };
}

/* ── mutations ─────────────────────────────────────────────────────────── */

export function addToCart(product, qty = 1) {
  const items = getCartItems();
  const existing = items.find((item) => item.id === product.id);
  if (existing) {
    commit(
      items.map((item) =>
        item.id === product.id
          ? { ...item, qty: Math.min(MAX_QTY, item.qty + qty) }
          : item
      )
    );
    return;
  }
  commit([...items, { ...pickFields(product), qty: Math.min(MAX_QTY, qty) }]);
}

export function setQty(id, qty) {
  if (qty < 1) {
    removeFromCart(id);
    return;
  }
  commit(
    getCartItems().map((item) =>
      item.id === id ? { ...item, qty: Math.min(MAX_QTY, qty) } : item
    )
  );
}

export function removeFromCart(id) {
  commit(getCartItems().filter((item) => item.id !== id));
}

export function clearCart() {
  commit(EMPTY_CART);
}

/* Replaces the whole local cart with `items` - used when adopting the cart
 * stored against the signed-in account (see components/CartSync.jsx). */
export function setCart(items) {
  commit(Array.isArray(items) ? items : EMPTY_CART);
}

/* ── read hook ─────────────────────────────────────────────────────────── */

export function useCart() {
  const items = useSyncExternalStore(subscribe, getCartItems, getServerSnapshot);

  let count = 0;
  let subtotal = 0;
  for (const item of items) {
    count += item.qty;
    subtotal += item.price * item.qty;
  }

  return { items, count, subtotal, addToCart, removeFromCart, setQty, clearCart };
}
