import Link from "next/link";
import AdminGate from "./AdminGate";
import "./admin.css";

/* Every /admin page is auth-gated and fetches its data in the browser, so
 * none of them can render instant UI - opt the whole area out of Next's
 * instant-navigation validation (dev-only diagnostic). */
export const instant = false;

/* Admin area layout: a sidebar on the left, page content on the right.
 * All /admin pages render inside this. AdminGate (client) keeps the UI in
 * step with the session - the API is what actually enforces admin access. */
export default function AdminLayout({ children }) {
  return (
    <AdminGate>
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
    </AdminGate>
  );
}
