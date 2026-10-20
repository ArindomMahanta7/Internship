"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductForm from "../../ProductForm";
import { fetchProduct, updateProduct } from "../../../../../lib/api";

/* Edit a product. params is a Promise in client components too, so unwrap it
 * with use(). The record is fetched by id (the API owns the data), and the
 * form starts from those values. Uploading new photos replaces the list;
 * leaving the picker empty keeps the current ones. */
export default function EditProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error | missing
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let alive = true;

    fetchProduct(id)
      .then((found) => {
        if (!alive) return;
        setProduct(found);
        setStatus(found ? "ready" : "missing");
      })
      .catch((err) => {
        if (!alive) return;
        setLoadError(err.message);
        setStatus("error");
      });

    return () => {
      alive = false;
    };
  }, [id]);

  async function handleSubmit(fields) {
    await updateProduct(id, fields);
    router.push("/admin/products");
    router.refresh();
  }

  if (status === "loading") {
    return <p className="admin-note">Loading product…</p>;
  }

  if (status === "error") {
    return (
      <div>
        <h1 className="admin-title">Edit product</h1>
        <p className="admin-message admin-message--error" role="alert">
          Couldn&apos;t load this product: {loadError}
        </p>
        <Link href="/admin/products" className="admin-link">
          ← Back to products
        </Link>
      </div>
    );
  }

  if (status === "missing" || !product) {
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
      <p className="admin-note">
        {product.brand} {product.name}
      </p>

      <ProductForm
        values={{
          brandName: product.brand,
          modelName: product.name,
          description: product.description,
          tagline: product.tagline,
          price: String(product.price ?? ""),
          oldPrice: product.oldPrice ? String(product.oldPrice) : "",
          badge: product.badge ?? "",
          color: product.color,
          stock: String(product.stock ?? ""),
          images: product.images,
        }}
        onSubmit={handleSubmit}
        submitLabel="Update product"
        submittingLabel="Updating…"
      />

      <Link href="/admin/products" className="admin-link">
        ← Back to products
      </Link>
    </div>
  );
}
