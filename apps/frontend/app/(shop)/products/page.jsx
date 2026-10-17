import Navbar from "../../../components/layout/navbar";
import Footer from "../../../components/layout/footer";
import { brandFont } from "../../../components/auth/brand-font";
import "../../../components/home/home.css";

/* Product catalog. Placeholder for now: renders the shop chrome so navigation
 * works, and the grid + carousel can be built into it. */
export default function ProductsPage() {
  return (
    <div className={`home-page ${brandFont.variable}`}>
      <Navbar />
      <main>
        <section className="section">
          <div className="section__head">
            <h1 className="section__title">All products</h1>
            <p className="section__sub">Full catalog coming soon.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
