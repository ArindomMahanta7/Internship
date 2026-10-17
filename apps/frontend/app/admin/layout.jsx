import Link from "next/link";
import "./admin.css";

/* Admin area layout: a sidebar on the left, page content on the right.
 * All /admin pages render inside this. */
export default function AdminLayout({ children }) {
  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <div className="admin-logo">BuyCart Admin</div>

        <nav className="admin-nav">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/orders">Orders</Link>
          <Link href="/admin/products">Products</Link>
          <Link href="/admin/analytics">Analytics</Link>
          <Link href="/admin/users">Users</Link>
        </nav>

        <Link href="/" className="admin-back">
          ← Back to store
        </Link>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
