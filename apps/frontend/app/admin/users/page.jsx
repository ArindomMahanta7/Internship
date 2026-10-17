/* Users list. Hardcoded for now. */

const users = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@mail.com",
    orders: 6,
    joined: "Jan 2026",
  },
  {
    id: 2,
    name: "Priya Verma",
    email: "priya@mail.com",
    orders: 3,
    joined: "Feb 2026",
  },
  {
    id: 3,
    name: "Amit Khan",
    email: "amit@mail.com",
    orders: 1,
    joined: "May 2026",
  },
  {
    id: 4,
    name: "Sneha Iyer",
    email: "sneha@mail.com",
    orders: 8,
    joined: "Jun 2026",
  },
  {
    id: 5,
    name: "Vikram Rao",
    email: "vikram@mail.com",
    orders: 2,
    joined: "Aug 2026",
  },
];

export default function UsersPage() {
  return (
    <div>
      <h1 className="admin-title">Users</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Orders</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.orders}</td>
              <td>{user.joined}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
