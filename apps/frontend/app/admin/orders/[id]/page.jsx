"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { fetchAdminOrder, updateOrderStatus } from "../../../../lib/api";
import { formatPrice } from "../../../../data/products";
import {
  badgeClass,
  customerEmail,
  customerName,
  formatDate,
  ORDER_STATUSES,
} from "../../shared";
import useAdminData from "../../useAdminData";

/* One order (GET /api/admin/orders/:id), plus an admin-only status control
 * (PATCH .../status). Checkout never collects a phone or address, so those
 * cards from the old placeholder are gone - this shows what the API
 * actually has.
 *
 * After a successful status save the fresh order from the PATCH response
 * overrides the loaded one, so the badge/table update instantly without a
 * refetch. */
export default function AdminOrderDetailPage() {
  const { id } = useParams();

  const { data, status, error, reload } = useAdminData(
    useCallback(() => fetchAdminOrder(id), [id])
  );

  const [override, setOverride] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const order = override ?? data;

  async function handleStatusChange(event) {
    const next = event.target.value;
    setSaving(true);
    setSaveError("");
    setSaved(false);

    try {
      const updated = await updateOrderStatus(id, next);
      setOverride(updated);
      setSaved(true);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return <p className="admin-note">Loading order…</p>;
  }

  if (status === "error") {
    return (
      <div>
        <h1 className="admin-title">Order</h1>
        <p className="admin-message admin-message--error" role="alert">
          Couldn&apos;t load this order: {error}
          <button type="button" className="admin-link" onClick={reload}>
            Try again
          </button>
        </p>
        <Link href="/admin/orders" className="admin-link">
          ← Back to orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <h1 className="admin-title">Order not found</h1>
        <Link href="/admin/orders" className="admin-link">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div>
      <div className="admin-head">
        <h1 className="admin-title">
          {order.orderRef ?? `Order #${String(order._id).slice(-6)}`}
        </h1>
        <span className={badgeClass(order.status)}>{order.status}</span>
      </div>

      {saveError ? (
        <p className="admin-message admin-message--error" role="alert">
          Couldn&apos;t update the order: {saveError}
        </p>
      ) : null}
      {saved ? (
        <p className="admin-message admin-message--ok" role="status">
          Order updated.
        </p>
      ) : null}

      <div className="admin-cards">
        <div className="admin-card">
          <p>Customer</p>
          <h2>{customerName(order)}</h2>
        </div>
        <div className="admin-card">
          <p>Email</p>
          <h2>{customerEmail(order)}</h2>
        </div>
        <div className="admin-card">
          <p>Placed</p>
          <h2>{formatDate(order.createdAt)}</h2>
        </div>
        <div className="admin-card">
          <p>Total</p>
          <h2>{formatPrice(order.totalAmount ?? 0)}</h2>
        </div>
      </div>

      <h2 className="admin-subtitle">Status</h2>
      <label className="admin-label" htmlFor="order-status">
        Update status
      </label>
      <select
        id="order-status"
        className="admin-input"
        value={order.status}
        onChange={handleStatusChange}
        disabled={saving}
      >
        {ORDER_STATUSES.map((value) => (
          <option key={value} value={value}>
            {value[0].toUpperCase() + value.slice(1)}
          </option>
        ))}
      </select>

      <h2 className="admin-subtitle">Items</h2>
      {items.length === 0 ? (
        <p className="admin-note">This order has no items.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              // `product` is populated by the API; fall back to the id if the
              // product has since been deleted.
              const product =
                item.product && typeof item.product === "object"
                  ? item.product
                  : null;
              const name = product
                ? `${product.brandName} ${product.modelName}`.trim()
                : "Product unavailable";

              return (
                <tr key={item.product?._id ?? index}>
                  <td>{name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price ?? 0)}</td>
                  <td>{formatPrice((item.price ?? 0) * item.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <Link href="/admin/orders" className="admin-link">
        ← Back to orders
      </Link>
    </div>
  );
}
