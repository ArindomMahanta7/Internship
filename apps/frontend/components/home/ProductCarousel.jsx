"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProductMedia from "../products/ProductMedia";
import { formatPrice } from "../../data/products";
import { fetchProducts } from "../../lib/api";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "../icons";
import { useCart } from "../../lib/cart";

/* Featured products in a horizontal, scroll-snapped carousel.
 * Client component: the arrow buttons scroll the track, and "Add to cart"
 * writes to the shared cart (lib/cart.js). The product list itself comes
 * from the API rather than the static catalog. The button reads "Added" while
 * the product is in the cart; clicking it again removes the product. */
export default function ProductCarousel() {
  const trackRef = useRef(null);
  const { items, addToCart, removeFromCart } = useCart();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let alive = true;
    fetchProducts()
      .then((list) => {
        if (!alive) return;
        setProducts(list);
        setStatus("ready");
      })
      .catch(() => {
        if (alive) setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, []);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.85);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="section products">
      <div className="section__head section__head--row">
        <div>
          <h2 className="section__title">Featured phones</h2>
          <p className="section__sub">Handpicked deals.</p>
        </div>

        <div className="products__controls">
          <Link href="/products" className="products__viewall">
            View all
            <ArrowRightIcon />
          </Link>
          <button
            type="button"
            className="products__arrow"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll to previous products"
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            className="products__arrow"
            onClick={() => scrollBy(1)}
            aria-label="Scroll to next products"
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>

      <div className="products__track" ref={trackRef} aria-busy={status === "loading"}>
        {status === "loading"
          ? Array.from({ length: 4 }).map((_, i) => (
              <article className="product-card" key={i} aria-hidden="true">
                <div className="product-card__art">
                  <div className="pcard__skeleton pcard__skeleton--art" />
                </div>
                <div className="product-card__info">
                  <div className="pcard__skeleton pcard__skeleton--line" style={{ width: "35%" }} />
                  <div className="pcard__skeleton pcard__skeleton--line" style={{ width: "75%" }} />
                  <div className="pcard__skeleton pcard__skeleton--line" style={{ width: "50%" }} />
                </div>
              </article>
            ))
          : status === "error"
            ? (
              <p className="section__sub" role="alert">
                Couldn&apos;t reach the store — refresh to try again.
              </p>
            )
            : products.length === 0
              ? (
                <p className="section__sub">No products yet — check back soon.</p>
              )
              : products.map((p) => {
          const isAdded = items.some((item) => item.id === p.id);
          return (
            <article className="product-card" key={p.id}>
              <div className="product-card__art">
                {p.badge ? <span className="product-card__badge">{p.badge}</span> : null}
                <ProductMedia
                  product={p}
                  className="product-card__phone"
                  sizes="(max-width: 760px) 70vw, 240px"
                />
              </div>

              <div className="product-card__info">
                <span className="product-card__brand">{p.brand}</span>
                <h3 className="product-card__name">{p.name}</h3>
                <p className="product-card__tagline">{p.tagline}</p>

                <div className="product-card__price">
                  <span className="product-card__now">{formatPrice(p.price)}</span>
                  {p.oldPrice ? (
                    <span className="product-card__old">{formatPrice(p.oldPrice)}</span>
                  ) : null}
                </div>

                <button
                  type="button"
                  className={`product-card__add${isAdded ? " is-added" : ""}`}
                  onClick={() => (isAdded ? removeFromCart(p.id) : addToCart(p))}
                >
                  {isAdded ? (
                    <>
                      <CheckIcon />
                      Added
                    </>
                  ) : (
                    "Add to cart"
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
