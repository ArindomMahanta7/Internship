"use client";

import Link from "next/link";
import { fetchAdminStats } from "../../lib/api";
import { formatPrice } from "../../data/products";
import { badgeClass, customerName, formatDate } from "./shared";
import useAdminData from "./useAdminData";

/* Dashboard: live totals from /api/admin/stats, then the five most recent
 * orders. Everything here is read-only - status changes live on the order
 * detail page. */
export default function AdminDashboard() {
  const { data, status, error, reload } = useAdminData(fetchAdminStats);

  const stats = data?.stats;
  const recentOrders = data?.recentOrders ?? [];

  const cards = [
    { title: "Total sales", value: stats ? formatPrice(stats.sales) : "—" },
    { title: "Orders", value: stats?.orders ?? "—" },
    { title: "Products", value: stats?.products ?? "—" },
    { title: "Users", value: stats?.users ?? "—" },
  ];

  return (
    <div>
      <h1 className="admin-title">Dashboard</h1>

      {status === "error" ? (
        <p className="admin-message admin-message--error" role="alert">
          Couldn&apos;t load the dashboard: {error}
          <button type="button" className="admin-link" onClick={reload}>
            Try again
          </button>
        </p>
      ) : null}

      <div className="admin-cards">
        {cards.map((card) => (
          <div className="admin-card" key={card.title}>
            <p>{card.title}</p>
            <h2>{status === "loading" ? "…" : card.value}</h2>
          </div>
        ))}
      </div>

      <h2 className="admin-subtitle">Recent orders</h2>

      {status === "loading" ? (
        <p className="admin-note">Loading orders…</p>
      ) : recentOrders.length === 0 ? (
        <p className="admin-note">
          No orders yet — once customers check out, they&apos;ll show up here.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order._id}>
                <td>
                  <Link href={`/admin/orders/${order._id}`}>
                    {order.orderRef ?? `#${String(order._id).slice(-6)}`}
                  </Link>
                </td>
                <td>{customerName(order)}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{formatPrice(order.totalAmount ?? 0)}</td>
                <td>
                  <span className={badgeClass(order.status)}>{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link href="/admin/orders" className="admin-link">
        View all orders →
      </Link>
    </div>
  );
}
