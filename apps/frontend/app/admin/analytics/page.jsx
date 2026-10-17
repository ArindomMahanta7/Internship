/* Analytics: some numbers, a simple bar chart, and a top-products list.
 * All hardcoded - no real tracking yet. */

const stats = [
  { title: "Revenue", value: "₹4,52,000" },
  { title: "Orders", value: "128" },
  { title: "Visitors", value: "12,400" },
  { title: "Conversion", value: "1.8%" },
];

/* height is just in pixels, keeps the chart simple */
const monthlySales = [
  { month: "Jun", height: 70 },
  { month: "Jul", height: 110 },
  { month: "Aug", height: 95 },
  { month: "Sep", height: 140 },
  { month: "Oct", height: 165 },
];

const topProducts = [
  { name: "Samsung Galaxy S24 Ultra", sold: 32 },
  { name: "Redmi Note 13 Pro+ 5G", sold: 54 },
  { name: "realme Narzo 70 Turbo 5G", sold: 61 },
  { name: "Nokia G42 5G", sold: 27 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="admin-title">Analytics</h1>

      <div className="admin-cards">
        {stats.map((stat) => (
          <div className="admin-card" key={stat.title}>
            <p>{stat.title}</p>
            <h2>{stat.value}</h2>
          </div>
        ))}
      </div>

      <h2 className="admin-subtitle">Sales (last 5 months)</h2>

      <div className="admin-bars">
        {monthlySales.map((row) => (
          <div className="admin-bar-wrap" key={row.month}>
            <div className="admin-bar" style={{ height: row.height + "px" }}></div>
            <span className="admin-bar-label">{row.month}</span>
          </div>
        ))}
      </div>

      <h2 className="admin-subtitle">Top products</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Units sold</th>
          </tr>
        </thead>
        <tbody>
          {topProducts.map((product) => (
            <tr key={product.name}>
              <td>{product.name}</td>
              <td>{product.sold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
