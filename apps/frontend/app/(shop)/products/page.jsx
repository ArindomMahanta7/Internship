"use client";

import { useEffect, useRef, useState, useCallback, forwardRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";

import Navbar from "../../../components/layout/navbar";
import Footer from "../../../components/layout/footer";
import PhoneArt from "../../../components/home/PhoneArt";
import { brandFont } from "../../../components/auth/brand-font";
import { PRODUCTS, BRANDS, formatPrice } from "../../../data/products";
import "../../../components/home/home.css";
import "../../../components/products/products.css";

/* ── helpers ────────────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name A–Z" },
];

const BRAND_COLORS = {
  Nokia: "#14b8a6",
  Samsung: "#2563eb",
  realme: "#f59e0b",
  Redmi: "#a855f7",
  Micromax: "#ef4444",
};

function savings(product) {
  if (!product.oldPrice) return null;
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
}

function sortProducts(list, sort) {
  const copy = [...list];
  if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
  else if (sort === "name-asc") copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}

/* ── CartIcon (inline to avoid extra import) ────────────────────── */
function CartPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── individual product card with GSAP expand ───────────────────── */
const ProductCard = forwardRef(function ProductCard({ product, index, allCardsRef }, ref) {
  const cardRef = useRef(null);
  // merge forwarded ref with local ref
  const setRef = useCallback((el) => {
    cardRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  }, [ref]);
  const [added, setAdded] = useState(false);

  /* Hover expand: card grows to flex-grow 1.5, siblings shrink to 0.6 */
  const onMouseEnter = useCallback(() => {
    const cards = allCardsRef.current;
    if (!cards) return;
    cards.forEach((el) => {
      if (!el) return;
      if (el === cardRef.current) {
        gsap.to(el, {
          flexGrow: 1.5,
          scale: 1.03,
          zIndex: 2,
          duration: 0.38,
          ease: "power2.out",
        });
      } else {
        gsap.to(el, {
          flexGrow: 0.6,
          scale: 0.97,
          zIndex: 1,
          duration: 0.38,
          ease: "power2.out",
        });
      }
    });
  }, [allCardsRef]);

  const onMouseLeave = useCallback(() => {
    const cards = allCardsRef.current;
    if (!cards) return;
    cards.forEach((el) => {
      if (!el) return;
      gsap.to(el, {
        flexGrow: 1,
        scale: 1,
        zIndex: 1,
        duration: 0.35,
        ease: "power2.inOut",
      });
    });
  }, [allCardsRef]);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (added) return;
    setAdded(true);
    /* Bounce feedback */
    gsap.fromTo(
      cardRef.current,
      { y: 0 },
      { y: -8, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }
    );
    setTimeout(() => setAdded(false), 2200);
  };

  const pct = savings(product);

  return (
    <Link
      href={`/products/${product.id}`}
      ref={setRef}
      className="pcard pcard--entry"
      data-index={index}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={`${product.brand} ${product.name}`}
    >
      <div className="pcard__art">
        {/* Coloured glow blob behind the phone */}
        <div
          className="pcard__art-glow"
          style={{
            background: `radial-gradient(60% 60% at 50% 60%, ${product.color}55 0%, transparent 100%)`,
          }}
        />
        {product.badge && (
          <span className="pcard__badge">{product.badge}</span>
        )}
        <PhoneArt color={product.color} className="pcard__phone" />
      </div>

      <div className="pcard__info">
        <span className="pcard__brand">{product.brand}</span>
        <h2 className="pcard__name">{product.name}</h2>
        <p className="pcard__tagline">{product.tagline}</p>
        <div className="pcard__price">
          <span className="pcard__now">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="pcard__old">{formatPrice(product.oldPrice)}</span>
          )}
          {pct && <span className="pcard__save">−{pct}%</span>}
        </div>
      </div>

      <button
        type="button"
        className={`pcard__add${added ? " is-added" : ""}`}
        onClick={handleAdd}
        aria-label={added ? "Added to cart" : `Add ${product.name} to cart`}
      >
        {added ? <CheckIcon /> : <CartPlus />}
        {added ? "Added!" : "Add to cart"}
      </button>
    </Link>
  );
});

/* ── catalog body (needs Suspense because of useSearchParams) ────── */
function ProductsInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") ?? "";

  const [activeBrand, setActiveBrand] = useState("All");
  const [sort, setSort] = useState("default");
  const [query] = useState(initialQuery);

  /* Shared ref array for all card DOM nodes (for GSAP sibling effects) */
  const allCardsRef = useRef([]);

  /* Derived product list */
  const filtered = PRODUCTS.filter((p) => {
    const matchBrand = activeBrand === "All" || p.brand === activeBrand;
    const matchQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase());
    return matchBrand && matchQuery;
  });
  const displayed = sortProducts(filtered, sort);

  /* Card entry animation whenever the list changes */
  useEffect(() => {
    const cards = allCardsRef.current.filter(Boolean);
    if (!cards.length) return;

    gsap.set(cards, { opacity: 0, y: 32 });
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.09,
      ease: "power3.out",
      clearProps: "transform",
    });
  }, [displayed.length, activeBrand, sort]);

  /* Banner entrance */
  const bannerRef = useRef(null);
  const sidebarRef = useRef(null);
  useEffect(() => {
    if (bannerRef.current) {
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.1 }
      );
    }
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.05 }
      );
    }
  }, []);

  return (
    <div className={`home-page products-page ${brandFont.variable}`}>
      <Navbar />
      <main>
        <div className="products-layout">
          {/* ── Sidebar ───────────────────────────── */}
          <aside className="products-sidebar" ref={sidebarRef} aria-label="Filters">
            <h1 className="products-sidebar__title">Products</h1>
            <p className="products-sidebar__desc">
              Explore our full catalogue of flagship &amp; mid-range smartphones
              from the world&apos;s top brands.
            </p>

            {/* Brand filter */}
            <div className="products-filters__group">
              <p className="products-filters__heading">Brand</p>
              {["All", ...BRANDS].map((brand) => (
                <button
                  key={brand}
                  type="button"
                  className={`filter-chip${activeBrand === brand ? " is-active" : ""}`}
                  onClick={() => setActiveBrand(brand)}
                  aria-pressed={activeBrand === brand}
                >
                  <span
                    className="filter-chip__dot"
                    style={{
                      background:
                        brand === "All" ? "var(--accent-soft)" : BRAND_COLORS[brand] ?? "var(--muted)",
                    }}
                  />
                  {brand}
                </button>
              ))}
            </div>

            <hr className="filter-divider" />

            {/* Sort */}
            <div className="products-filters__group">
              <p className="products-filters__heading">Sort by</p>
              <select
                className="filter-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          {/* ── Right content ─────────────────────── */}
          <section className="products-content" aria-label="Product catalog">
            {/* Banner */}
            <div className="products-banner" ref={bannerRef}>
              <Image
                src="/products-banner.png"
                alt="Discover the Future of Mobile"
                fill
                className="products-banner__img"
                priority
                sizes="(max-width: 860px) 100vw, calc(100vw - 280px)"
              />
              <div className="products-banner__overlay">
                <span className="products-banner__eyebrow">New arrivals</span>
                <h2 className="products-banner__title">
                  Discover the Future<br />of Mobile
                </h2>
                <p className="products-banner__sub">
                  Premium smartphones, unbeatable prices.
                </p>
              </div>
            </div>

            {/* Grid header */}
            <div className="products-grid-header">
              <p className="products-grid-header__label">
                Showing <strong>{displayed.length}</strong> product
                {displayed.length !== 1 ? "s" : ""}
                {activeBrand !== "All" ? ` · ${activeBrand}` : ""}
              </p>
            </div>

            {/* Product grid */}
            {displayed.length > 0 ? (
              <div className="products-grid" role="list" aria-label="Products">
                {displayed.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    allCardsRef={allCardsRef}
                    ref={(el) => { allCardsRef.current[i] = el; }}
                  />
                ))}
              </div>
            ) : (
              <div className="products-empty" role="status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.5" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p>No products found{query ? ` for "${query}"` : ""}.</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ── main page export ────────────────────────────────────────────── */
export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsInner />
    </Suspense>
  );
}
