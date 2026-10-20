"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/layout/navbar";
import Footer from "../../../components/layout/footer";
import ProductMedia from "../../../components/products/ProductMedia";
import { brandFont } from "../../../components/auth/brand-font";
import { formatPrice } from "../../../data/products";
import { fetchOrders, normalizeProduct } from "../../../lib/api";
import { useUser } from "../../../lib/auth";
import "../../../components/home/home.css";
import "../../../components/products/products.css";

/* Customer order history. The list lives in MongoDB against the signed-in
 * account (see apps/backend/src/controllers/orderController.js), so we wait
 * for /api/auth/me first: signed-out visitors are sent to /login rather than
 * shown an empty page. */
export default function OrdersPage() {
  return <OrdersInner />;
}

function OrdersInner() {
  const router = useRouter();
  const { user, status: authStatus } = useUser();

  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (authStatus !== "ready") return;
    if (!user) {
      router.replace("/login?next=/orders");
      return;
    }

    let alive = true;
    setStatus("loading");

    fetchOrders()
      .then((list) => {
        if (!alive) return;
        setOrders(list);
        setStatus("ready");
      })
      .catch((err) => {
        if (!alive) return;
        setLoadError(err.message);
        setStatus("error");
      });

    return () => {
      alive = false;
    };
  }, [authStatus, user, router]);

  return (
    <div className={`home-page ${brandFont.variable}`}>
      <Navbar />
      <main>
        <section className="section">
          <div className="section__head">
            <h1 className="section__title">Your orders</h1>
            <p className="section__sub">
              {status === "ready"
                ? `${orders.length} order${orders.length === 1 ? "" : "s"}`
                : "Loading your order history…"}
            </p>
          </div>
        </section>

        {status === "error" ? (
          <div className="products-empty" role="alert">
            <p>Couldn&apos;t load your orders: {loadError}</p>
            <button
              type="button"
              className="filter-chip"
              onClick={() => {
                setStatus("loading");
                fetchOrders()
                  .then((list) => {
                    setOrders(list);
                    setStatus("ready");
                  })
                  .catch((err) => {
                    setLoadError(err.message);
                    setStatus("error");
                  });
              }}
            >
              Try again
            </button>
          </div>
        ) : status === "loading" ? (
          <div className="orders-list" aria-busy="true" aria-label="Loading orders">
            {[0, 1].map((i) => (
              <div className="order-card order-card--loading" key={i} aria-hidden="true">
                <div className="pcard__skeleton pcard__skeleton--line" style={{ width: "30%" }} />
                <div className="pcard__skeleton pcard__skeleton--line" style={{ width: "55%", height: 18 }} />
                <div className="pcard__skeleton pcard__skeleton--line" style={{ width: "100%", height: 54 }} />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="products-empty" role="status">
            <p>No orders yet.</p>
            <Link href="/products" className="cart__btn cart__btn--primary">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <OrderCard order={order} key={order._id} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function OrderCard({ order }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const placedAt = order.createdAt ? new Date(order.createdAt) : null;
  const statusKey = String(order.status ?? "pending").toLowerCase();

  return (
    <article className="order-card">
      <header className="order-card__head">
        <div>
          <p className="order-card__ref">{order.orderRef ?? `#${order._id?.slice(-6)}`}</p>
          {placedAt ? (
            <p className="order-card__date">
              {placedAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          ) : null}
        </div>
        <span className={`order-card__status order-card__status--${statusKey}`}>
          {order.status ?? "pending"}
        </span>
      </header>

      <ul className="order-card__items">
        {items.map((item, i) => {
          // `items.product` is populated by the API; fall back to the id if it
          // was deleted since the order was placed.
          const product = item.product && typeof item.product === "object"
            ? normalizeProduct(item.product)
            : { id: item.product, brand: "", name: "Product unavailable", images: [], color: "#94a3b8" };

          return (
            <li className="order-card__item" key={item.product?._id ?? item.product ?? i}>
              <div className="order-card__art" aria-hidden="true">
                <ProductMedia product={product} className="cart-item__phone" />
              </div>
              <div className="order-card__info">
                {product.brand ? <span className="order-card__brand">{product.brand}</span> : null}
                <h2 className="order-card__name">{product.name}</h2>
                <p className="order-card__meta">
                  Qty {item.quantity} · {formatPrice(item.price)} each
                </p>
              </div>
              <strong className="order-card__total">
                {formatPrice(item.price * item.quantity)}
              </strong>
            </li>
          );
        })}
      </ul>

      <footer className="order-card__foot">
        <span>{items.length} item{items.length === 1 ? "" : "s"}</span>
        <strong>{formatPrice(order.totalAmount ?? 0)}</strong>
      </footer>
    </article>
  );
}
