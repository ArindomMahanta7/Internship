import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navbar from "../../../../components/layout/navbar";
import Footer from "../../../../components/layout/footer";
import ProductDetail from "../../../../components/products/ProductDetail";
import { brandFont } from "../../../../components/auth/brand-font";
import { fetchProduct, fetchProducts, ApiError } from "../../../../lib/api";
import "../../../../components/home/home.css";

/* This page can't render anything without the URL's `id`, so tell the Cache
 * Components "instant navigation" validator that blocking here is expected.
 * Without this, every request logs a URL-data-outside-Suspense warning in
 * development (see the `instant` route segment config). */
export const instant = false;

/* Product detail page (/products/[id]).
 *
 * ids are Mongo ObjectIds owned by the API, so they can't be listed at build
 * time - there is no generateStaticParams. The product itself is fetched in
 * <ProductContent> below: it sits behind a Suspense boundary so the page
 * shell (nav/footer/breadcrumb) prerenders instantly and the record streams
 * in, which is what Cache Components requires of an uncached fetch. */

export default function ProductPage({ params }) {
  return (
    <div className={`home-page ${brandFont.variable}`}>
      <Navbar />
      <main>
        <Suspense fallback={<ProductSkeleton />}>
          <ProductContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

async function ProductContent({ params }) {
  const { id } = await params;

  let product;
  try {
    product = await fetchProduct(id);
  } catch (error) {
    // Unknown/malformed id -> the friendly 404 in this folder.
    if (error instanceof ApiError && error.status === 404) notFound();
    // Backend unreachable: don't crash the route, explain inline.
    return <CatalogUnavailable message={error.message} />;
  }

  if (!product) notFound();

  /* Related products are best-effort - the detail page still renders if
   * this second call fails. */
  let related = [];
  try {
    related = await fetchProducts();
  } catch {
    related = [];
  }

  return <ProductDetail product={product} related={related} />;
}

function ProductSkeleton() {
  return (
    <section className="pdp pdp--loading" aria-busy="true" aria-label="Loading product">
      <div className="pdp__art">
        <div className="pdp__skeleton" style={{ width: 180, height: 310 }} />
      </div>
      <div className="pdp__info">
        <div className="pdp__skeleton" style={{ width: 90, height: 12 }} />
        <div className="pdp__skeleton" style={{ width: "70%", height: 34, marginTop: 10 }} />
        <div className="pdp__skeleton" style={{ width: "45%", height: 16, marginTop: 12 }} />
        <div className="pdp__skeleton" style={{ width: "35%", height: 26, marginTop: 18 }} />
        <div className="pdp__skeleton" style={{ width: "100%", height: 96, marginTop: 24 }} />
      </div>
    </section>
  );
}

function CatalogUnavailable({ message }) {
  return (
    <section className="products-empty" role="alert">
      <p>Couldn&apos;t load this product: {message}</p>
      <a href="/products" className="cart__btn cart__btn--primary">
        Back to products
      </a>
    </section>
  );
}
