"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchProducts, deleteProduct } from "../../../lib/api";
import { formatPrice } from "../../../data/products";

/* Admin product list, straight from the API. Deleting is optimistic-ish: the
 * row is removed once the DELETE succeeds, with an inline error if it fails. */
export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [rowError, setRowError] = useState("");

  const load = useCallback(() => {
    setStatus("loading");
    fetchProducts()
      .then((list) => {
        setProducts(list);
        setStatus("ready");
      })
      .catch((err) => {
        setLoadError(err.message);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(product) {
    const confirmed = window.confirm(`Delete ${product.brand} ${product.name}?`);
    if (!confirmed) return;

    setDeletingId(product.id);
    setRowError("");

    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((p) => p.id !== product.id));
    } catch (err) {
      setRowError(`Couldn't delete ${product.name}: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="admin-head">
        <h1 className="admin-title">Products</h1>
        <Link href="/admin/products/add" className="admin-btn">
          + Add product
        </Link>
      </div>

      {rowError ? (
        <p className="admin-message admin-message--error" role="alert">
          {rowError}
        </p>
      ) : null}

      {status === "error" ? (
        <p className="admin-message admin-message--error" role="alert">
          Couldn&apos;t load products: {loadError}
          <button type="button" className="admin-link" onClick={load}>
            Try again
          </button>
        </p>
      ) : status === "loading" ? (
        <p className="admin-note">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="admin-note">
          No products yet — <Link href="/admin/products/add">add the first one</Link>.
        </p>
      ) : (
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
                <td>{formatPrice(product.price)}</td>
                <td>{product.stock > 0 ? product.stock : "Out of stock"}</td>
                <td className="admin-table__actions">
                  <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                  <button
                    type="button"
                    className="admin-link admin-link--danger"
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
