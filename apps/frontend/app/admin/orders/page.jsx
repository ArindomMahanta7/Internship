"use client";

import Link from "next/link";
import { fetchAllOrders } from "../../../lib/api";
import { formatPrice } from "../../../data/products";
import { badgeClass, customerName, formatDate } from "../shared";
import useAdminData from "../useAdminData";

/* Every order from every customer, newest first (GET /api/admin/orders).
 * Each row links to the detail page, where the status can be changed. */
export default function AdminOrdersPage() {
  const { data: orders, status, error, reload } = useAdminData(fetchAllOrders);

  return (
    <div>
      <h1 className="admin-title">Orders</h1>

      {status === "error" ? (
        <p className="admin-message admin-message--error" role="alert">
          Couldn&apos;t load orders: {error}
          <button type="button" className="admin-link" onClick={reload}>
            Try again
          </button>
        </p>
      ) : status === "loading" ? (
        <p className="admin-note">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="admin-note">No orders yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.orderRef ?? `#${String(order._id).slice(-6)}`}</td>
                <td>{customerName(order)}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  {(order.items ?? []).reduce((n, item) => n + item.quantity, 0)}
                </td>
                <td>{formatPrice(order.totalAmount ?? 0)}</td>
                <td>
                  <span className={badgeClass(order.status)}>{order.status}</span>
                </td>
                <td>
                  <Link href={`/admin/orders/${order._id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
