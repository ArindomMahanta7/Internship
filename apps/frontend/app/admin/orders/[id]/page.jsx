import Link from "next/link";

/* Single order. Gets the order id from the URL (params is a Promise now, so
 * we await it), then shows that order's details. */

const orders = [
  {
    id: "1001",
    customer: "Rahul Sharma",
    phone: "9876543210",
    address: "12 MG Road, Bengaluru",
    date: "12 Oct 2026",
    status: "Paid",
    items: [
      { name: "Samsung Galaxy S24 Ultra", qty: 1, price: "₹1,29,999" },
    ],
  },
  {
    id: "1002",
    customer: "Priya Verma",
    phone: "9812345678",
    address: "45 Anna Nagar, Chennai",
    date: "11 Oct 2026",
    status: "Shipped",
    items: [{ name: "realme Narzo 70 Turbo 5G", qty: 1, price: "₹17,999" }],
  },
  {
    id: "1003",
    customer: "Amit Khan",
    phone: "9900112233",
    address: "7 Park Street, Kolkata",
    date: "10 Oct 2026",
    status: "Pending",
    items: [{ name: "Redmi Note 13 Pro+ 5G", qty: 1, price: "₹29,999" }],
  },
];

function badgeClass(status) {
  if (status === "Paid") return "admin-badge green";
  if (status === "Shipped") return "admin-badge blue";
  return "admin-badge yellow";
}

export default async function OrderDetailPage({ params }) {
  const { id } = await params;

  const order = orders.find((o) => o.id === id);

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

  return (
    <div>
      <div className="admin-head">
        <h1 className="admin-title">Order #{order.id}</h1>
        <span className={badgeClass(order.status)}>{order.status}</span>
      </div>

      <div className="admin-cards">
        <div className="admin-card">
          <p>Customer</p>
          <h2>{order.customer}</h2>
        </div>
        <div className="admin-card">
          <p>Phone</p>
          <h2>{order.phone}</h2>
        </div>
        <div className="admin-card">
          <p>Date</p>
          <h2>{order.date}</h2>
        </div>
        <div className="admin-card">
          <p>Items</p>
          <h2>{order.items.length}</h2>
        </div>
      </div>

      <h2 className="admin-subtitle">Shipping address</h2>
      <p>{order.address}</p>

      <h2 className="admin-subtitle">Items</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{item.qty}</td>
              <td>{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link href="/admin/orders" className="admin-link">
        ← Back to orders
      </Link>
    </div>
  );
}
