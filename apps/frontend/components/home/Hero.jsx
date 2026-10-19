"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowRightIcon } from "../icons";

/* ─── Hero ────────────────────────────────────────────────────────────────
 * Layout (matches the sketch):
 *
 *  ┌──────────────────────────────────────────────────┐
 *  │  heading text        │   IMAGE 1 (large phone)   │
 *  │──────────────────────────────────────────────────│
 *  │  CTA buttons │ IMAGE 2 (promo) │ site details    │
 *  └──────────────────────────────────────────────────┘
 *
 * Scroll behaviour: as the user scrolls down, each column/panel slides
 * outward (left col → left, right col → right, bottom row → down) while
 * fading to opacity 0.  Uses a plain IntersectionObserver + requestAnimationFrame
 * approach — no external deps.
 * ─────────────────────────────────────────────────────────────────────────*/

export default function Hero() {
  const heroRef = useRef(null);
  const topLeftRef = useRef(null);
  const topRightRef = useRef(null);
  const bottomLeftRef = useRef(null);
  const bottomMidRef = useRef(null);
  const bottomRightRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    let rafId = null;

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const rect = hero.getBoundingClientRect();
        const heroH = hero.offsetHeight;
        // progress: 0 (top of hero at viewport top) → 1 (bottom of hero at viewport top)
        const rawProgress = -rect.top / heroH;
        const progress = Math.max(0, Math.min(1, rawProgress));

        // translate amounts only — no fade
        const leftX = -(progress * 80);   // px, slide left
        const rightX = progress * 80;      // px, slide right
        const downY = progress * 60;       // px, slide down

        const applyStyle = (el, tx, ty) => {
          if (!el) return;
          el.style.transform = `translate(${tx}px, ${ty}px)`;
        };

        applyStyle(topLeftRef.current, leftX, 0);
        applyStyle(topRightRef.current, rightX, 0);
        applyStyle(bottomLeftRef.current, leftX, downY);
        applyStyle(bottomMidRef.current, 0, downY);
        applyStyle(bottomRightRef.current, rightX, downY);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="hero2" ref={heroRef}>
      {/* ── decorative blobs ── */}
      <span className="hero2__blob hero2__blob--a" aria-hidden="true" />
      <span className="hero2__blob hero2__blob--b" aria-hidden="true" />

      <div className="hero2__inner">
        {/* ══ TOP ROW ══════════════════════════════════════════════════ */}
        <div className="hero2__top">
          {/* Top-left: eyebrow + headline */}
          <div className="hero2__top-left" ref={topLeftRef}>
            <span className="hero2__eyebrow">
              <span className="hero2__eyebrow-dot" />
              The Phone Marketplace
            </span>

            <h1 className="hero2__title">
              Your next phone,
              <br />
              <span className="hero2__accent">at the best price.</span>
            </h1>

            <p className="hero2__subtitle">
              Browse 120+ premium smartphones from Apple, Samsung, OnePlus &amp; more — all verified, all great value.
            </p>
          </div>

          {/* Top-right: large phone illustration */}
          <div className="hero2__top-right" ref={topRightRef}>
            <div className="hero2__img-wrap hero2__img-wrap--main">
              <Image
                src="/hero-phone-main.png"
                alt="Premium smartphone"
                fill
                priority
                style={{ objectFit: "contain", objectPosition: "center" }}
                sizes="(max-width: 900px) 90vw, 50vw"
              />
              {/* floating badge */}
              <span className="hero2__float-badge">
                120+ phones in stock
              </span>
            </div>
          </div>
        </div>

        {/* ══ BOTTOM ROW ═══════════════════════════════════════════════ */}
        <div className="hero2__bottom">
          {/* Bottom-left: CTA buttons + stats */}
          <div className="hero2__bottom-left" ref={bottomLeftRef}>
            <div className="hero2__actions">
              <Link href="/products" className="hero2__btn hero2__btn--primary" id="hero-shop-now">
                Shop now <ArrowRightIcon />
              </Link>
              <Link href="/products" className="hero2__btn hero2__btn--ghost" id="hero-view-deals">
                View deals
              </Link>
            </div>
            <ul className="hero2__stats">
              <li>
                <strong>50k+</strong>
                <span>Happy customers</span>
              </li>
              <li>
                <strong>120+</strong>
                <span>Phones listed</span>
              </li>
              <li>
                <strong>4.9★</strong>
                <span>Avg. rating</span>
              </li>
            </ul>
          </div>

          {/* Bottom-mid: promo image card */}
          <div className="hero2__bottom-mid" ref={bottomMidRef}>
            <div className="hero2__img-wrap hero2__img-wrap--promo">
              <Image
                src="/hero-promo-banner.png"
                alt="Up to 40% off on top phones"
                fill
                style={{ objectFit: "cover", objectPosition: "center" }}
                sizes="(max-width: 900px) 90vw, 30vw"
              />
              <div className="hero2__promo-overlay">
                <span className="hero2__promo-tag">Limited offer</span>
                <p className="hero2__promo-text">Up to <strong>40% off</strong> on flagship phones</p>
              </div>
            </div>
          </div>

          {/* Bottom-right: site details / value props */}
          <div className="hero2__bottom-right" ref={bottomRightRef}>
            <ul className="hero2__props">
              <li className="hero2__prop">
                <span className="hero2__prop-icon">🚚</span>
                <div>
                  <strong>Free shipping</strong>
                  <p>On orders above ₹999</p>
                </div>
              </li>
              <li className="hero2__prop">
                <span className="hero2__prop-icon">🔒</span>
                <div>
                  <strong>Secure payments</strong>
                  <p>UPI, cards &amp; wallets accepted</p>
                </div>
              </li>
              <li className="hero2__prop">
                <span className="hero2__prop-icon">↩️</span>
                <div>
                  <strong>Easy returns</strong>
                  <p>7-day hassle-free returns</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
