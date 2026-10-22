"use client";

import { fetchAnalytics } from "../../../lib/api";
import { formatPrice } from "../../../data/products";
import useAdminData from "../useAdminData";

/* Revenue, order count, a per-month bar chart and the best sellers, all
 * from real orders (GET /api/admin/analytics).
 *
 * The old placeholder showed "Visitors" and "Conversion" - there is no
 * visit tracking in this app, so those are gone rather than faked. Bars are
 * scaled to the tallest month (min 8px so an empty month stays visible). */
const MAX_BAR_PX = 165;
const MIN_BAR_PX = 8;

export default function AnalyticsPage() {
  const { data, status, error, reload } = useAdminData(fetchAnalytics);

  const monthly = data?.monthly ?? [];
  const topProducts = data?.topProducts ?? [];
  const peak = Math.max(1, ...monthly.map((row) => row.revenue));

  const barHeight = (revenue) =>
    revenue <= 0
      ? MIN_BAR_PX
      : Math.max(MIN_BAR_PX, Math.round((revenue / peak) * MAX_BAR_PX));

  const cards = [
    { title: "Revenue", value: data ? formatPrice(data.stats.revenue) : "—" },
    { title: "Orders", value: data?.stats.orders ?? "—" },
    {
      title: "Avg. order value",
      value:
        data && data.stats.orders > 0
          ? formatPrice(Math.round(data.stats.revenue / data.stats.orders))
          : "—",
    },
    { title: "Best sellers", value: topProducts.length },
  ];

  return (
    <div>
      <h1 className="admin-title">Analytics</h1>

      {status === "error" ? (
        <p className="admin-message admin-message--error" role="alert">
          Couldn&apos;t load analytics: {error}
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

      <h2 className="admin-subtitle">Revenue (last 5 months)</h2>

      {status === "loading" ? (
        <p className="admin-note">Loading chart…</p>
      ) : monthly.every((row) => row.revenue === 0) ? (
        <p className="admin-note">No revenue recorded yet.</p>
      ) : (
        <>
          <div className="admin-bars" aria-hidden="true">
            {monthly.map((row) => (
              <div
                className="admin-bar-wrap"
                key={row.key}
                title={formatPrice(row.revenue)}
              >
                <div
                  className="admin-bar"
                  style={{ height: barHeight(row.revenue) + "px" }}
                />
                <span className="admin-bar-label">{row.label}</span>
              </div>
            ))}
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>{row.orders}</td>
                  <td>{formatPrice(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h2 className="admin-subtitle">Top products</h2>

      {status === "loading" ? (
        <p className="admin-note">Loading products…</p>
      ) : topProducts.length === 0 ? (
        <p className="admin-note">Nothing sold yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Units sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((row) => {
              const product = row.product;
              const name =
                product && typeof product === "object"
                  ? `${product.brandName} ${product.modelName}`.trim()
                  : "Deleted product";

              return (
                <tr key={String(product?._id ?? row._id ?? name)}>
                  <td>{name}</td>
                  <td>{row.sold}</td>
                  <td>{formatPrice(row.revenue ?? 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
