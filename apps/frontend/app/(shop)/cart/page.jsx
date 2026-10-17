import Navbar from "../../../components/layout/navbar";
import Footer from "../../../components/layout/footer";
import { brandFont } from "../../../components/auth/brand-font";
import "../../../components/home/home.css";

/* Shopping cart. Placeholder for now: renders the shop chrome so navigation
 * works; the line items + checkout can be built into it. */
export default function CartPage() {
  return (
    <div className={`home-page ${brandFont.variable}`}>
      <Navbar />
      <main>
        <section className="section">
          <div className="section__head">
            <h1 className="section__title">Your cart</h1>
            <p className="section__sub">Your bag is empty.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
