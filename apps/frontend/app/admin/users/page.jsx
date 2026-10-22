"use client";

import { fetchAllUsers } from "../../../lib/api";
import { formatPrice } from "../../../data/products";
import { formatDate } from "../shared";
import useAdminData from "../useAdminData";

/* Every registered account with its order count and lifetime spend
 * (GET /api/admin/users). The counts come from an aggregation over the
 * orders collection, so accounts that never ordered show 0. */
export default function UsersPage() {
  const { data: users, status, error, reload } = useAdminData(fetchAllUsers);

  return (
    <div>
      <h1 className="admin-title">Users</h1>

      {status === "error" ? (
        <p className="admin-message admin-message--error" role="alert">
          Couldn&apos;t load users: {error}
          <button type="button" className="admin-link" onClick={reload}>
            Try again
          </button>
        </p>
      ) : status === "loading" ? (
        <p className="admin-note">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="admin-note">No accounts yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Orders</th>
              <th>Spent</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`admin-badge ${user.role === "admin" ? "blue" : "green"}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td>{user.orders}</td>
                <td>{formatPrice(user.spent ?? 0)}</td>
                <td>{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
