import Navbar from "../../../components/layout/navbar";
import Footer from "../../../components/layout/footer";
import { brandFont } from "../../../components/auth/brand-font";
import "../../../components/home/home.css";

/* Customer orders list. Placeholder for now: renders the shop chrome so the
 * navbar "Orders" link resolves; the order history can be built into it. */
export default function OrdersPage() {
  return (
    <div className={`home-page ${brandFont.variable}`}>
      <Navbar />
      <main>
        <section className="section">
          <div className="section__head">
            <h1 className="section__title">Your orders</h1>
            <p className="section__sub">No orders yet.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
