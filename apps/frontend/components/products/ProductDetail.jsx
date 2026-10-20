"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductMedia from "./ProductMedia";
import { CheckIcon } from "../icons";
import { formatPrice } from "../../data/products";
import { useCart, MAX_QTY } from "../../lib/cart";
import "./products.css";

/* The interactive part of the product detail page: product photo (or the
 * generated phone art when the record has none), price with savings,
 * quantity picker, "Add to cart" (shared cart store in lib/cart.js), a
 * "Buy now" shortcut to /cart, and a "You may also like" row fed by the
 * `related` products the route fetched. */
export default function ProductDetail({ product, related = [] }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const discountPct = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  /* Same-brand products first, then the rest, up to four. */
  const suggestions = [
    ...related.filter((p) => p.brand === product.brand && p.id !== product.id),
    ...related.filter((p) => p.brand !== product.brand && p.id !== product.id),
  ].slice(0, 4);

  const handleAdd = () => {
    if (added) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const buyNow = () => {
    addToCart(product, qty);
    router.push("/cart");
  };

  return (
    <>
      <nav className="pdp__crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/products">Products</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <section className="pdp">
        <div className="pdp__art">
          {product.badge ? (
            <span className="pdp__badge">{product.badge}</span>
          ) : null}
          <ProductMedia
          product={product}
          className="pdp__phone"
          sizes="(max-width: 900px) 90vw, 420px"
          priority
        />
        </div>

        <div className="pdp__info">
          <span className="pdp__brand">{product.brand}</span>
          <h1 className="pdp__name">{product.name}</h1>
          <p className="pdp__tag">{product.tagline}</p>

          <div className="pdp__price">
            <span className="pdp__now">{formatPrice(product.price)}</span>
            {product.oldPrice ? (
              <span className="pdp__old">{formatPrice(product.oldPrice)}</span>
            ) : null}
            {discountPct > 0 ? (
              <span className="pdp__save">{discountPct}% off</span>
            ) : null}
          </div>

          <p className={`pdp__stock${product.stock > 0 ? "" : " is-out"}`}>
            <span className="pdp__stock-dot" aria-hidden="true" />
            {product.stock > 0 ? (
              <>
                In stock{product.stock <= 5 ? ` · only ${product.stock} left` : ""} · Free
                delivery over ₹999
              </>
            ) : (
              "Out of stock"
            )}
          </p>

          {product.description ? (
            <p className="pdp__desc">{product.description}</p>
          ) : null}

          <div className="pdp__buy">
            <div className="cart-item__qty" role="group" aria-label="Quantity">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span>{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                disabled={qty >= MAX_QTY}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className={`pdp__add${added ? " is-added" : ""}`}
              onClick={handleAdd}
              aria-label={added ? "Added to cart" : `Add ${product.name} to cart`}
            >
              {added ? (
                <>
                  <CheckIcon />
                  Added to cart
                </>
              ) : (
                "Add to cart"
              )}
            </button>

            <button type="button" className="pdp__buy-now" onClick={buyNow}>
              Buy now
            </button>
          </div>
        </div>
      </section>

      {suggestions.length > 0 ? (
        <section className="section pdp__related">
          <div className="section__head">
            <h2 className="section__title">You may also like</h2>
          </div>
          <div className="pdp__related-grid">
            {suggestions.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="product-card"
              >
                <div className="product-card__art">
                  {p.badge ? (
                    <span className="product-card__badge">{p.badge}</span>
                  ) : null}
                  <ProductMedia
                    product={p}
                    className="product-card__phone"
                    sizes="(max-width: 760px) 45vw, 220px"
                  />
                </div>
                <div className="product-card__info">
                  <span className="product-card__brand">{p.brand}</span>
                  <h3 className="product-card__name">{p.name}</h3>
                  <div className="product-card__price">
                    <span className="product-card__now">
                      {formatPrice(p.price)}
                    </span>
                    {p.oldPrice ? (
                      <span className="product-card__old">
                        {formatPrice(p.oldPrice)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
