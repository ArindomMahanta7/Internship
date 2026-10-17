"use client";

import { use, useState } from "react";
import Link from "next/link";

/* Same list as the products page - just so we can look one up by id. */
const products = [
  {
    id: "galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: "129999",
  },
  {
    id: "realme-narzo-70-turbo",
    name: "realme Narzo 70 Turbo 5G",
    brand: "realme",
    price: "17999",
  },
  {
    id: "redmi-note-13-pro-plus",
    name: "Redmi Note 13 Pro+ 5G",
    brand: "Redmi",
    price: "29999",
  },
  {
    id: "nokia-g42-5g",
    name: "Nokia G42 5G",
    brand: "Nokia",
    price: "12499",
  },
];

/* Edit a product. params is a Promise in client components too, so unwrap it
 * with use(). Form starts with the current values. */
export default function EditProductPage({ params }) {
  const { id } = use(params);

  const found = products.find((product) => product.id === id);

  const [name, setName] = useState(found ? found.name : "");
  const [brand, setBrand] = useState(found ? found.brand : "");
  const [price, setPrice] = useState(found ? found.price : "");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    // TODO: send this to the API once the backend is ready.
    setMessage("Product updated! (demo - nothing was saved)");
  }

  if (!found) {
    return (
      <div>
        <h1 className="admin-title">Product not found</h1>
        <Link href="/admin/products" className="admin-link">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="admin-title">Edit product</h1>

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

        <button className="admin-btn" type="submit">
          Update product
        </button>

        {message ? <p className="admin-message">{message}</p> : null}
      </form>

      <Link href="/admin/products" className="admin-link">
        ← Back to products
      </Link>
    </div>
  );
}
