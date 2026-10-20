import Link from "next/link";
import Navbar from "../../../../components/layout/navbar";
import Footer from "../../../../components/layout/footer";
import { BagIcon } from "../../../../components/icons";
import { brandFont } from "../../../../components/auth/brand-font";
import "../../../../components/home/home.css";

/* Shown when a product id doesn't match the catalog (notFound() in page.jsx).
 * Reuses the shop chrome and the cart empty-state card so the 404 still
 * feels like part of the store. */
export default function ProductNotFound() {
  return (
    <div className={`home-page ${brandFont.variable}`}>
      <Navbar />
      <main>
        <section className="section">
          <div className="section__head">
            <h1 className="section__title">Product not found</h1>
            <p className="section__sub">That product doesn’t exist (yet).</p>
          </div>
        </section>

        <section className="cart-empty">
          <span className="cart-empty__icon" aria-hidden="true">
            <BagIcon />
          </span>
          <h2>Let’s find you something else</h2>
          <p>
            This link doesn’t match anything in the catalog — the full list of
            phones is one click away.
          </p>
          <Link href="/products" className="cart__btn cart__btn--primary">
            Browse products
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
