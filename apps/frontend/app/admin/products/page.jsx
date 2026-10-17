import Link from "next/link";

/* Products list. Hardcoded for now, each row links to its edit page. */

const products = [
  {
    id: "galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: "₹1,29,999",
    stock: 12,
  },
  {
    id: "realme-narzo-70-turbo",
    name: "realme Narzo 70 Turbo 5G",
    brand: "realme",
    price: "₹17,999",
    stock: 45,
  },
  {
    id: "redmi-note-13-pro-plus",
    name: "Redmi Note 13 Pro+ 5G",
    brand: "Redmi",
    price: "₹29,999",
    stock: 30,
  },
  {
    id: "nokia-g42-5g",
    name: "Nokia G42 5G",
    brand: "Nokia",
    price: "₹12,499",
    stock: 0,
  },
];

export default function AdminProductsPage() {
  return (
    <div>
      <div className="admin-head">
        <h1 className="admin-title">Products</h1>
        <Link href="/admin/products/add" className="admin-btn">
          + Add product
        </Link>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.brand}</td>
              <td>{product.price}</td>
              <td>{product.stock > 0 ? product.stock : "Out of stock"}</td>
              <td>
                <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
