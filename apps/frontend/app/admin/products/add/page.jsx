"use client";

import { useState } from "react";
import Link from "next/link";

/* Add a product. Basic form with useState, no real saving yet. */
export default function AddProductPage() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    // TODO: send this to the API once the backend is ready.
    setMessage("Product added! (demo - nothing was saved)");
  }

  return (
    <div>
      <h1 className="admin-title">Add product</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="admin-label">
          Name
          <input
            className="admin-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="admin-label">
          Brand
          <input
            className="admin-input"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          />
        </label>

        <label className="admin-label">
          Price
          <input
            className="admin-input"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </label>

        <label className="admin-label">
          Stock
          <input
            className="admin-input"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
          />
        </label>

        <button className="admin-btn" type="submit">
          Save product
        </button>

        {message ? <p className="admin-message">{message}</p> : null}
      </form>

      <Link href="/admin/products" className="admin-link">
        ← Back to products
      </Link>
    </div>
  );
}
