"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import PhoneArt from "./PhoneArt";
import { PRODUCTS, formatPrice } from "../../data/products";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "../icons";

/* Featured products in a horizontal, scroll-snapped carousel.
 * Client component: the arrow buttons scroll the track, and "Add to cart"
 * gives local "Added" feedback (real cart state comes later). */
export default function ProductCarousel() {
  const trackRef = useRef(null);
  const [added, setAdded] = useState(() => new Set());

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.85);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const toggleAdded = (id) => {
    setAdded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

      <div className="products__track" ref={trackRef}>
        {PRODUCTS.map((p) => {
          const isAdded = added.has(p.id);
          return (
            <article className="product-card" key={p.id}>
              <div className="product-card__art">
                {p.badge ? <span className="product-card__badge">{p.badge}</span> : null}
                <PhoneArt color={p.color} className="product-card__phone" />
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
                  onClick={() => toggleAdded(p.id)}
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
