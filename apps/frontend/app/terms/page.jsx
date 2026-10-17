import Navbar from "../../components/layout/navbar";
import Footer from "../../components/layout/footer";
import { brandFont } from "../../components/auth/brand-font";
import "../../components/home/home.css";

/* Terms of Service. Placeholder for now: renders the site chrome so the
 * register-page "Terms" link resolves. */
export default function TermsPage() {
  return (
    <div className={`home-page ${brandFont.variable}`}>
      <Navbar />
      <main>
        <section className="section">
          <div className="section__head">
            <h1 className="section__title">Terms of Service</h1>
            <p className="section__sub">Coming soon.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
