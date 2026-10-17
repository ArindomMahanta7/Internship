import Link from "next/link";

/* Dashboard: a few numbers at the top, then the latest orders.
 * All data is just hardcoded for now. */

const stats = [
  { title: "Total sales", value: "₹4,52,000" },
  { title: "Orders", value: "128" },
  { title: "Products", value: "24" },
  { title: "Users", value: "890" },
];

const recentOrders = [
  { id: "1001", customer: "Rahul Sharma", total: "₹1,29,999", status: "Paid" },
  { id: "1002", customer: "Priya Verma", total: "₹17,999", status: "Shipped" },
  { id: "1003", customer: "Amit Khan", total: "₹29,999", status: "Pending" },
  { id: "1004", customer: "Sneha Iyer", total: "₹12,499", status: "Paid" },
];

function badgeClass(status) {
  if (status === "Paid") return "admin-badge green";
  if (status === "Shipped") return "admin-badge blue";
  return "admin-badge yellow";
}

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="admin-title">Dashboard</h1>

      <div className="admin-cards">
        {stats.map((stat) => (
          <div className="admin-card" key={stat.title}>
            <p>{stat.title}</p>
            <h2>{stat.value}</h2>
          </div>
        ))}
      </div>

      <h2 className="admin-subtitle">Recent orders</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.map((order) => (
            <tr key={order.id}>
              <td>
                <Link href={`/admin/orders/${order.id}`}>#{order.id}</Link>
              </td>
              <td>{order.customer}</td>
              <td>{order.total}</td>
              <td>
                <span className={badgeClass(order.status)}>{order.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link href="/admin/orders" className="admin-link">
        View all orders →
      </Link>
    </div>
  );
}
