import Link from "next/link";

/* Orders list. Hardcoded for now, each row links to its detail page. */

const orders = [
  {
    id: "1001",
    customer: "Rahul Sharma",
    date: "12 Oct 2026",
    total: "₹1,29,999",
    status: "Paid",
  },
  {
    id: "1002",
    customer: "Priya Verma",
    date: "11 Oct 2026",
    total: "₹17,999",
    status: "Shipped",
  },
  {
    id: "1003",
    customer: "Amit Khan",
    date: "10 Oct 2026",
    total: "₹29,999",
    status: "Pending",
  },
  {
    id: "1004",
    customer: "Sneha Iyer",
    date: "09 Oct 2026",
    total: "₹12,499",
    status: "Paid",
  },
  {
    id: "1005",
    customer: "Vikram Rao",
    date: "08 Oct 2026",
    total: "₹2,09,998",
    status: "Shipped",
  },
];

function badgeClass(status) {
  if (status === "Paid") return "admin-badge green";
  if (status === "Shipped") return "admin-badge blue";
  return "admin-badge yellow";
}

export default function OrdersPage() {
  return (
    <div>
      <h1 className="admin-title">Orders</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.date}</td>
              <td>{order.total}</td>
              <td>
                <span className={badgeClass(order.status)}>{order.status}</span>
              </td>
              <td>
                <Link href={`/admin/orders/${order.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
