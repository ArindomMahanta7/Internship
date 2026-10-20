"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/layout/navbar";
import Footer from "../../../components/layout/footer";
import ProductMedia from "../../../components/products/ProductMedia";
import { BagIcon, CheckIcon } from "../../../components/icons";
import { brandFont } from "../../../components/auth/brand-font";
import { formatPrice } from "../../../data/products";
import { useCart, MAX_QTY } from "../../../lib/cart";
import { createOrder, fetchMe, pushCart, ApiError } from "../../../lib/api";
import "../../../components/home/home.css";

/* Shopping cart: line items, quantities, a demo promo code and a real
 * checkout. The cart lives in localStorage (see lib/cart.js) so it survives
 * reloads; on "Place order" it is pushed to the account's server cart and
 * turned into an order, so the Orders page can show it afterwards.
 *
 * Every "random" value is generated in a click handler, never during render
 * (Cache Components rejects unstable values like Math.random() at prerender
 * time). */
const PROMO_CODE = "BUYCART10";
const PROMO_RATE = 0.1;
const FREE_DELIVERY_OVER = 999;
const FLAT_DELIVERY = 49;

function EmptyCart() {
  return (
    <section className="cart-empty">
      <span className="cart-empty__icon" aria-hidden="true">
        <BagIcon />
      </span>
      <h2>Your bag is empty</h2>
      <p>Nothing here yet — browse the catalog and add something you love.</p>
      <Link href="/products" className="cart__btn cart__btn--primary">
        Browse products
      </Link>
    </section>
  );
}

function OrderPlaced({ orderRef, total }) {
  return (
    <section className="cart-done">
      <span className="cart-done__check" aria-hidden="true">
        <CheckIcon />
      </span>
      <h2>Order {orderRef} placed</h2>
      <p>
        Nothing was charged — this store takes no real payment — but your order
        is saved to your account and the cart is cleared.
      </p>
      {total ? <p className="cart-done__total">{formatPrice(total)}</p> : null}
      <div className="cart-done__actions">
        <Link href="/orders" className="cart__btn cart__btn--primary">
          View orders
        </Link>
        <Link href="/products" className="cart__btn cart__btn--ghost">
          Continue shopping
        </Link>
      </div>
    </section>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { items, count, subtotal, setQty, removeFromCart, clearCart } = useCart();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null); // { code, rate } once valid
  const [promoError, setPromoError] = useState("");
  const [orderRef, setOrderRef] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const discount = applied ? Math.round(subtotal * applied.rate) : 0;
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_OVER ? 0 : FLAT_DELIVERY;
  const total = subtotal - discount + delivery;

  const applyPromo = (event) => {
    event.preventDefault();
    const candidate = code.trim().toUpperCase();
    if (candidate === PROMO_CODE) {
      setApplied({ code: candidate, rate: PROMO_RATE });
      setPromoError("");
    } else {
      setApplied(null);
      setPromoError(
        candidate ? `“${candidate}” isn’t a valid code.` : "Enter a code first."
      );
    }
  };

  const removePromo = () => {
    setApplied(null);
    setCode("");
    setPromoError("");
  };

  /* Real checkout: the order lives in MongoDB against the signed-in account,
   * so the browser cart is pushed to the server cart first (POST /orders
   * reads the server cart, not localStorage). */
  const placeOrder = async () => {
    if (items.length === 0 || placing) return;

    setPlacing(true);
    setCheckoutError("");

    try {
      const user = await fetchMe();
      if (!user) {
        // Not signed in — orders belong to an account, so send them to login
        // and come back here afterwards.
        router.push("/login?next=/cart");
        return;
      }

      await pushCart(items);
      const order = await createOrder();

      setOrderTotal(total);
      setOrderRef(order?.order?.orderRef ?? order?.orderRef ?? "BC-000000");
      clearCart();
      removePromo();
    } catch (err) {
      setCheckoutError(
        err instanceof ApiError && err.status === 401
          ? "Please sign in to place an order."
          : err.message
      );
    } finally {
      setPlacing(false);
    }
  };

  let subtitle = "Your bag is empty.";
  if (orderRef) {
    subtitle = "Order saved to your account.";
  } else if (count > 0) {
    subtitle = `${count} item${count === 1 ? "" : "s"} · Free delivery over ₹999`;
  }

  return (
    <div className={`home-page ${brandFont.variable}`}>
      <Navbar />
      <main>
        <section className="section">
          <div className="section__head">
            <h1 className="section__title">
              {orderRef ? "Order placed" : "Your cart"}
            </h1>
            <p className="section__sub">{subtitle}</p>
          </div>
        </section>

        {orderRef ? (
          <OrderPlaced orderRef={orderRef} total={orderTotal} />
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="cart">
            <ul className="cart__list">
              {items.map((item) => (
                <li className="cart-item" key={item.id}>
                  <div className="cart-item__art" aria-hidden="true">
                    <ProductMedia product={item} className="cart-item__phone" />
                  </div>

                  <div className="cart-item__info">
                    <span className="cart-item__brand">{item.brand}</span>
                    <h2 className="cart-item__name">{item.name}</h2>
                    <p className="cart-item__tag">{item.tagline}</p>
                  </div>

                  <div
                    className="cart-item__qty"
                    role="group"
                    aria-label={`Quantity of ${item.name}`}
                  >
                    <button
                      type="button"
                      onClick={() => setQty(item.id, item.qty - 1)}
                      disabled={item.qty <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(item.id, item.qty + 1)}
                      disabled={item.qty >= MAX_QTY}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item__end">
                    <strong className="cart-item__total">
                      {formatPrice(item.price * item.qty)}
                    </strong>
                    {item.qty > 1 ? (
                      <span className="cart-item__each">
                        {formatPrice(item.price)} each
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="cart__summary">
              <h2 className="cart__summary-title">Order summary</h2>

              <form className="cart__promo" onSubmit={applyPromo}>
                <input
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Promo code"
                  aria-label="Promo code"
                  disabled={Boolean(applied)}
                />
                <button type="submit" disabled={Boolean(applied)}>
                  {applied ? "Applied" : "Apply"}
                </button>
              </form>
              {promoError ? <p className="cart__promo-error">{promoError}</p> : null}
              {applied ? (
                <p className="cart__promo-ok">
                  {applied.code} applied —10% off.{" "}
                  <button
                    type="button"
                    className="cart__promo-remove"
                    onClick={removePromo}
                  >
                    Remove
                  </button>
                </p>
              ) : (
                <p className="cart__promo-hint">Try BUYCART10 for10% off.</p>
              )}

              <div className="cart__rows">
                <div className="cart__row">
                  <span>
                    Subtotal ({count} item{count === 1 ? "" : "s"})
                  </span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                {discount > 0 ? (
                  <div className="cart__row cart__row--good">
                    <span>Discount</span>
                    <strong>−{formatPrice(discount)}</strong>
                  </div>
                ) : null}
                <div className="cart__row">
                  <span>Delivery</span>
                  {delivery === 0 ? (
                    <strong className="cart__free">FREE</strong>
                  ) : (
                    <strong>{formatPrice(delivery)}</strong>
                  )}
                </div>
                <div className="cart__row cart__row--total">
                  <span>Total</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
              </div>

              {checkoutError ? (
                <p className="cart__promo-error" role="alert">
                  {checkoutError}
                </p>
              ) : null}
              <button
                type="button"
                className="cart__checkout"
                onClick={placeOrder}
                disabled={placing || items.length === 0}
              >
                {placing ? "Placing order…" : `Place order · ${formatPrice(total)}`}
              </button>
              <p className="cart__note">
                No payment is taken — orders are saved to your account.
              </p>

              <Link href="/products" className="cart__continue">
                ← Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
