import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import Hero from "../components/home/Hero";
import BrandLoop from "../components/home/BrandLoop";
import Categories from "../components/home/Categories";
import ProductCarousel from "../components/home/ProductCarousel";
import { brandFont } from "../components/auth/brand-font";
import "../components/home/home.css";

/* BuyCart home page: navbar → hero → brand marquee → categories → featured
 * product carousel → footer. The dark-glass theme lives in home.css, and the
 * splash (SplashGate in layout.tsx) fades straight into this. */
export default function HomePage() {
  return (
    <div className={`home-page ${brandFont.variable}`}>
      <Navbar />
      <main>
        <Hero />
        <BrandLoop />
        <Categories />
        <ProductCarousel />
      </main>
      <Footer />
    </div>
  );
}
