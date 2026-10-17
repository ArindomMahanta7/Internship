import Navbar from "../../components/layout/navbar";
import Footer from "../../components/layout/footer";
import { brandFont } from "../../components/auth/brand-font";
import "../../components/home/home.css";

/* Privacy Policy. Placeholder for now: renders the site chrome so the
 * register-page "Privacy" link resolves. */
export default function PrivacyPage() {
  return (
    <div className={`home-page ${brandFont.variable}`}>
      <Navbar />
      <main>
        <section className="section">
          <div className="section__head">
            <h1 className="section__title">Privacy Policy</h1>
            <p className="section__sub">Coming soon.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
