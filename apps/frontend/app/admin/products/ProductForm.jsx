"use client";

import { useState } from "react";

/* Shared add/edit product form for the admin area.
 *
 * Fields mirror what the API accepts (see apps/backend/src/controllers/
 * productController.js): brandName/modelName/description are required, the
 * rest are optional. Photos arrive as uploaded files appended to a multipart
 * body under the "images" key - up to 5, and optional.
 *
 *   values   initial field values (edit mode passes the loaded product)
 *   onSubmit (fields) => Promise - fields.images is a File[]
 *   submitLabel / submittingLabel
 */
const FIELD_DEFAULTS = {
  brandName: "",
  modelName: "",
  description: "",
  tagline: "",
  price: "",
  oldPrice: "",
  badge: "",
  color: "#3b82f6",
  stock: "",
};

export default function ProductForm({
  values = {},
  onSubmit,
  submitLabel = "Save product",
  submittingLabel = "Saving…",
}) {
  const [fields, setFields] = useState(() => ({
    ...FIELD_DEFAULTS,
    ...values,
    // Never seed file inputs from state - browsers forbid it.
    images: [],
  }));
  const [existingImages, setExistingImages] = useState(
    Array.isArray(values.images) ? values.images : []
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function setField(name, value) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // Light client-side checks that mirror the API's rules.
    if (!fields.brandName.trim() || !fields.modelName.trim()) {
      setError("Brand and model name are required.");
      return;
    }
    if (!fields.description.trim()) {
      setError("Please add a description.");
      return;
    }
    if (fields.price === "" || Number(fields.price) < 0) {
      setError("Enter a valid price.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(fields);
      setDone(true);
    } catch (err) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label className="admin-label">
        Brand *
        <input
          className="admin-input"
          value={fields.brandName}
          onChange={(event) => setField("brandName", event.target.value)}
          placeholder="Samsung"
          required
        />
      </label>

      <label className="admin-label">
        Model name *
        <input
          className="admin-input"
          value={fields.modelName}
          onChange={(event) => setField("modelName", event.target.value)}
          placeholder="Galaxy S25 Ultra"
          required
        />
      </label>

      <label className="admin-label">
        Description *
        <textarea
          className="admin-input"
          rows={3}
          value={fields.description}
          onChange={(event) => setField("description", event.target.value)}
          placeholder="Display, camera, battery…"
          required
        />
      </label>

      <label className="admin-label">
        Tagline
        <input
          className="admin-input"
          value={fields.tagline}
          onChange={(event) => setField("tagline", event.target.value)}
          placeholder="Galaxy AI is here"
        />
      </label>

      <div className="admin-row">
        <label className="admin-label">
          Price (₹) *
          <input
            className="admin-input"
            type="number"
            min="0"
            value={fields.price}
            onChange={(event) => setField("price", event.target.value)}
            required
          />
        </label>

        <label className="admin-label">
          MRP (₹)
          <input
            className="admin-input"
            type="number"
            min="0"
            value={fields.oldPrice}
            onChange={(event) => setField("oldPrice", event.target.value)}
            placeholder="Struck-through price"
          />
        </label>
      </div>

      <div className="admin-row">
        <label className="admin-label">
          Stock
          <input
            className="admin-input"
            type="number"
            min="0"
            value={fields.stock}
            onChange={(event) => setField("stock", event.target.value)}
          />
        </label>

        <label className="admin-label">
          Badge
          <input
            className="admin-input"
            value={fields.badge}
            onChange={(event) => setField("badge", event.target.value)}
            placeholder="Flagship / Hot / Best value"
          />
        </label>
      </div>

      <label className="admin-label">
        Accent colour
        <span className="admin-color">
          <input
            className="admin-color__swatch"
            type="color"
            value={fields.color}
            onChange={(event) => setField("color", event.target.value)}
          />
          <input
            className="admin-input"
            value={fields.color}
            onChange={(event) => setField("color", event.target.value)}
          />
        </span>
      </label>

      <label className="admin-label">
        Photos
        <input
          className="admin-input"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => setField("images", Array.from(event.target.files ?? []))}
        />
        <span className="admin-note">
          Optional — up to 5. Leave empty to keep the generated phone art.
        </span>
      </label>

      {existingImages.length > 0 ? (
        <div className="admin-thumbs">
          {existingImages.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="admin-thumb" />
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="admin-message admin-message--error" role="alert">
          {error}
        </p>
      ) : null}
      {done ? (
        <p className="admin-message admin-message--ok" role="status">
          Saved.
        </p>
      ) : null}

      <button className="admin-btn" type="submit" disabled={submitting}>
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
