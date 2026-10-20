"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductForm from "../ProductForm";
import { createProduct } from "../../../../lib/api";

/* Add a product: POST /api/product/create as multipart (the API accepts up to
 * 5 photos alongside the fields). On success, return to the list. */
export default function AddProductPage() {
  const router = useRouter();

  async function handleSubmit(fields) {
    await createProduct(fields);
    router.push("/admin/products");
    // Refresh so the list re-fetches with the new row.
    router.refresh();
  }

  return (
    <div>
      <h1 className="admin-title">Add product</h1>

      <ProductForm onSubmit={handleSubmit} submitLabel="Save product" />

      <Link href="/admin/products" className="admin-link">
        ← Back to products
      </Link>
    </div>
  );
}
